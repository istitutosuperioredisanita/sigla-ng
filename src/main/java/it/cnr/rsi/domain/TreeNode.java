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
    private List<Pair<String, String>> breadcrumb;
    public TreeNode(String id, String description, String process, List<Pair<String, String>> breadcrumb) {
        this.id = id;
        this.description = description;
        this.process = process;
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

    @Override
    public String toString() {
        return "TreeNode{" +
            "id='" + id + '\'' +
            ", description='" + description + '\'' +
            ", process='" + process + '\'' +
            ", breadcrumb=" + breadcrumb +
            '}';
    }

}
