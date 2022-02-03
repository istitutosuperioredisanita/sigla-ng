terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "3.89.0"
    }
  }
}

provider "google" {
  region = var.region
  zone   = var.zone
}

provider "google-beta" {
  region = var.region
  zone   = var.zone
}

resource "google_compute_network" "vpc_network" {
  project                 = var.project_id
  name                    = "vpc-team-digi-sigla-poc-001"
  auto_create_subnetworks = false
  mtu                     = 1460
}

resource "google_compute_subnetwork" "subnet" {
  name                     = "sub-team-digi-sigla-poc-001-main-ew4"
  ip_cidr_range            = "10.0.0.0/9"
  region                   = var.region
  network                  = google_compute_network.vpc_network.name
  project                  = var.project_id
  private_ip_google_access = true
}

resource "google_artifact_registry_repository" "docker_registry" {
  provider = google-beta

  location = var.region
  repository_id = "ar-team-digi-sigla-poc-001"
  format = "DOCKER"
}

#BACK END CLOUD RUN
resource "google_project_service" "vpc-access-api" {
  service  = "vpcaccess.googleapis.com"
  provider = google-beta
  disable_on_destroy = false
  project  = var.project_id
}

# VPC access connector
resource "google_vpc_access_connector" "connector" {
  name          = "vac-team-digi-sigla"
  provider      = google-beta
  region        = var.region
  ip_cidr_range = "192.168.0.0/28"
  network       = google_compute_network.vpc_network.name
  depends_on    = [google_project_service.vpc-access-api, google_compute_subnetwork.subnet]
  project  = var.project_id
}

# Cloud Router
resource "google_compute_router" "router" {
  name     = "rtr-team-digi-sigla"
  provider = google-beta
  region   = var.region
  network  = google_compute_network.vpc_network.name
  project  = var.project_id
}



#PRIVATE DATABASE RESOURCES
resource "google_compute_global_address" "private-ip-address" {
  provider = google-beta

  name          = "pvip-team-digi-sigla"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc_network.name
  project  = var.project_id
  depends_on = [google_compute_subnetwork.subnet]
}

resource "google_service_networking_connection" "private-vpc-connection" {
  provider = google-beta

  network                 = "projects/${var.project_id}/global/networks/${google_compute_network.vpc_network.name}"
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private-ip-address.name]
}

resource "google_sql_database_instance" "instance" {
  provider = google-beta

  name             = "pdb-team-digi-sigla-001"
  region           = var.region
  database_version = "POSTGRES_9_6"
  project  = var.project_id

  depends_on = [google_service_networking_connection.private-vpc-connection]

  settings {
    tier = "db-g1-small"
    availability_type = "ZONAL"
    ip_configuration {
      ipv4_enabled    = false
      private_network = "projects/${var.project_id}/global/networks/${google_compute_network.vpc_network.name}"
    }
  }
}
