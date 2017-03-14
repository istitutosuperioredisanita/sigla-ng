package it.cnr.rsi.domain;

/**
 * Created by francesco on 14/03/17.
 */
public class TreeNode {

    private String id;
    private String description;
    private String process;

    public TreeNode(String id, String description, String process) {
        this.id = id;
        this.description = description;
        this.process = process;
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
                '}';
    }
}
