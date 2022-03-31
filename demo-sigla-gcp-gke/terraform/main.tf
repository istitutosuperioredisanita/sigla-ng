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
  project                 = var.project_id
  location = var.region
  repository_id = "ar-team-digi-sigla-poc-001"
  format = "DOCKER"
}

resource "google_project_service" "vpc-access-api" {
  service  = "vpcaccess.googleapis.com"
  provider = google-beta
  disable_on_destroy = false
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

resource "google_compute_router_nat" "nat" {
  name                               = "nat-digi-team-sigla-gke-001"
  router                             = google_compute_router.router.name
  region                             = google_compute_router.router.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
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

  #comment line above to prevent database deletion
  deletion_protection = false

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
#GKE CLUSTER
resource "google_service_account" "default" {
  account_id   = "sa-team-digi-sigla-poc-001"
  display_name = "Service Account"
  project                 = var.project_id
}


resource "google_container_cluster" "primary" {
  project                 = var.project_id
  name     = "gke-team-digi-sigla-poc-001"
  location = var.region

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  initial_node_count = 1
  network = google_compute_network.vpc_network.self_link
  subnetwork = google_compute_subnetwork.subnet.self_link
  node_config {
    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = google_service_account.default.email
    machine_type = "e2-medium"
    oauth_scopes = [
      "https://www.googleapis.com/auth/devstorage.read_only",      
      "https://www.googleapis.com/auth/logging.write",       
      "https://www.googleapis.com/auth/monitoring",       
      "https://www.googleapis.com/auth/servicecontrol",       
      "https://www.googleapis.com/auth/service.management.readonly",
      "https://www.googleapis.com/auth/trace.append"
       
    ]
    image_type = "COS_CONTAINERD"
  }
  node_locations = [
      "europe-west4-a",
      "europe-west4-b",
      "europe-west4-c"
    ]
  private_cluster_config {
    enable_private_nodes = true
    enable_private_endpoint = false
    master_ipv4_cidr_block = "192.168.0.0/28"
  }
  #networking_mode = "VPC_NATIVE"
}