package it.cnr.rsi.domain;

import java.io.Serializable;

/**
 * Created by francesco on 14/03/17.
 */
public class TreeNode implements Serializable{

	private static final long serialVersionUID = 1L;
	private String id;
    private String description;
    private String process;
    private String breadcrumb;
    

    public TreeNode(String id, String description, String process, String breadcrumb) {
        this.id = id;
        this.description = description;
        this.process = process;
        this.breadcrumb = breadcrumb;
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

    public String getBreadcrumb() {
		return breadcrumb;
	}

	@Override
    public String toString() {
        return "TreeNode{" +
                "id='" + id + '\'' +
                ", description='" + description + '\'' +
                ", process='" + process + '\'' +
                ", breadcrumb='" + breadcrumb + '\'' +
                '}';
    }
}
