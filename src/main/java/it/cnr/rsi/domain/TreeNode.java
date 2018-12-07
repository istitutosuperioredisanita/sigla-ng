package it.cnr.rsi.domain;

import org.apache.commons.lang3.tuple.Pair;

import java.io.Serializable;
import java.util.List;

/**
 * Created by francesco on 14/03/17.
 */
public class TreeNode implements Serializable{
    private static final long serialVersionUID = 1L;

    private String id;
    private String description;
    private String process;
    private String cdaccesso;
    private String dsaccesso;
    private List<Pair<String, String>> breadcrumb;
    public TreeNode(String id, String description, String process, String cdaccesso, String dsaccesso, List<Pair<String, String>> breadcrumb) {
        this.id = id;
        this.description = description;
        this.process = process;
        this.cdaccesso = cdaccesso;
        this.dsaccesso = dsaccesso;
        this.breadcrumb = breadcrumb;
    }

    public List<Pair<String, String>> getBreadcrumb() {
        return breadcrumb;
    }

    public String getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public String getProcess() {
        return process;
    }

    public String getCdaccesso() {
        return cdaccesso;
    }

    public String getDsaccesso() {
        return dsaccesso;
    }

    @Override
    public String toString() {
        return "TreeNode{" +
            "id='" + id + '\'' +
            ", description='" + description + '\'' +
            ", process='" + process + '\'' +
            ", cdaccesso='" + cdaccesso + '\'' +
            ", dsaccesso='" + dsaccesso + '\'' +
            ", breadcrumb=" + breadcrumb +
            '}';
    }

}
