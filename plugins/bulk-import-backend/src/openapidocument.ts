// Generated file. Do not edit.
const OPENAPI = `
{
  "openapi": "3.1.0",
  "info": {
    "version": "1.0",
    "title": "Bulk Import",
    "description": "The Bulk Import Backend APIs allow users to bulk import Backstage entities into the backstage catalog from remote sources such as Git."
  },
  "paths": {
    "/ping": {
      "get": {
        "operationId": "ping",
        "summary": "Check the health of the bulk-import backend router",
        "tags": [
          "Management"
        ],
        "responses": {
          "200": {
            "description": "The backend router for the bulk-import backend is up and running",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "enum": [
                        "ok"
                      ]
                    }
                  }
                },
                "example": {
                  "status": "ok"
                }
              }
            }
          }
        }
      }
    },
    "/repositories": {
      "get": {
        "operationId": "findAllRepositories",
        "summary": "Fetch Organization Repositories accessible by Backstage Github Integrations",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "tags": [
          "Repository"
        ],
        "responses": {
          "200": {
            "description": "Repository list was fetched successfully with no errors",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Repository"
                  }
                },
                "examples": {
                  "multipleRepos": {
                    "$ref": "#/components/examples/multipleRepos"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/imports": {
      "get": {
        "operationId": "findAllImports",
        "summary": "Fetch Import Jobs",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "tags": [
          "Import"
        ],
        "responses": {
          "200": {
            "description": "Import Jobs list was fetched successfully with no errors",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Import"
                  }
                },
                "examples": {
                  "twoImports": {
                    "$ref": "#/components/examples/twoImports"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "operationId": "createImportJobs",
        "summary": "Submit Import Jobs",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "tags": [
          "Import"
        ],
        "requestBody": {
          "description": "List of Import jobs to create",
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ImportRequest"
                }
              },
              "examples": {
                "multipleImportRequests": {
                  "$ref": "#/components/examples/multipleImportRequests"
                }
              }
            }
          }
        },
        "responses": {
          "202": {
            "description": "Import Jobs request was submitted successfully to the API. Check the status in each item of the response body list to see their individual status.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Import"
                  }
                },
                "examples": {
                  "twoImports": {
                    "$ref": "#/components/examples/twoImports"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Repository": {
        "title": "Repository",
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "unique identifier"
          },
          "name": {
            "type": "string",
            "description": "repository name"
          },
          "url": {
            "type": "string",
            "description": "repository URL"
          },
          "organization": {
            "type": "string",
            "description": "organization which the repository is part of"
          },
          "defaultCatalogInfo": {
            "type": "string",
            "description": "base content of the catalog-info.yaml to include in the import Pull Request."
          },
          "importStatus": {
            "$ref": "#/components/schemas/ImportStatus"
          }
        }
      },
      "ApprovalTool": {
        "type": "string",
        "enum": [
          "GIT",
          "SERVICENOW"
        ]
      },
      "ImportStatus": {
        "type": "string",
        "nullable": true,
        "description": "Import Job status",
        "enum": [
          "WAIT_APPROVAL",
          "ADDED",
          "WAIT_PR_START",
          "WAIT_PR_APPROVAL",
          "PR_REJECTED",
          "WAIT_SERVICENOW_START",
          "WAIT_SERVICENOW_RESOLUTION",
          "PR_ERROR",
          "SERVICENOW_ERROR",
          "SERVICENOW_TICKET_REJECTED",
          null
        ]
      },
      "Import": {
        "title": "Import Job",
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "status": {
            "$ref": "#/components/schemas/ImportStatus"
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "approvalTool": {
            "$ref": "#/components/schemas/ApprovalTool"
          },
          "repository": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "repository name"
              },
              "url": {
                "type": "string",
                "description": "repository URL"
              },
              "organization": {
                "type": "string",
                "description": "organization which the repository is part of"
              }
            }
          },
          "github": {
            "type": "object",
            "description": "GitHub details. Applicable if approvalTool is git.",
            "properties": {
              "pullRequest": {
                "type": "object",
                "properties": {
                  "url": {
                    "type": "string",
                    "description": "URL of the Pull Request"
                  }
                }
              }
            }
          }
        }
      },
      "ImportRequest": {
        "title": "Import Job request",
        "type": "object",
        "properties": {
          "approvalTool": {
            "$ref": "#/components/schemas/ApprovalTool"
          },
          "repository": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "repository name"
              },
              "url": {
                "type": "string",
                "description": "repository URL"
              },
              "organization": {
                "type": "string",
                "description": "organization which the repository is part of"
              }
            }
          },
          "catalogInfoContent": {
            "type": "string",
            "description": "content of the catalog-info.yaml to include in the import Pull Request."
          },
          "github": {
            "type": "object",
            "description": "GitHub details. Applicable if approvalTool is git.",
            "properties": {
              "pullRequest": {
                "type": "object",
                "description": "Pull Request details. Applicable if approvalTool is git.",
                "properties": {
                  "title": {
                    "type": "string",
                    "description": "title of the Pull Request"
                  },
                  "body": {
                    "type": "string",
                    "description": "body of the Pull Request"
                  }
                }
              }
            }
          }
        }
      }
    },
    "securitySchemes": {
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Backstage Permissions Framework JWT"
      }
    },
    "examples": {
      "multipleRepos": {
        "summary": "Multiple repositories",
        "value": [
          {
            "id": "unique-id-1",
            "name": "pet-app",
            "url": "https://github.com/my-org/pet-app",
            "organization": "https://github.com/my-org",
            "importStatus": "WAIT_PR_APPROVAL",
            "defaultCatalogInfo": "apiVersion: backstage.io/v1alpha1\\nkind: Component\\nmetadata:\\n  name: pet-app\\n  annotations:\\n    github.com/project-slug: my-org/pet-app\\nspec:\\n  type: other\\n  lifecycle: unknown\\n  owner: my-org"
          },
          {
            "id": "unique-id-2",
            "name": "project-zero",
            "url": "https://ghe.example.com/my-other-org/project-zero",
            "organization": "https://ghe.example.com/my-other-org",
            "importStatus": "PR_REJECTED",
            "defaultCatalogInfo": "apiVersion: backstage.io/v1alpha1\\nkind: Component\\nmetadata:\\n  name: project-zero\\n  annotations:\\n    github.com/project-slug: my-other-org/project-zero\\nspec:\\n  type: other\\n  lifecycle: unknown\\n  owner: my-other-org"
          },
          {
            "id": "unique-id-2",
            "name": "project-one",
            "url": "https://ghe.example.com/my-other-org-2/project-one",
            "organization": "https://ghe.example.com/my-other-org-2",
            "defaultCatalogInfo": "apiVersion: backstage.io/v1alpha1\\nkind: Component\\nmetadata:\\n  name: project-one\\n  annotations:\\n    github.com/project-slug: my-other-org-2/project-one\\nspec:\\n  type: other\\n  lifecycle: unknown\\n  owner: my-other-org-2"
          }
        ]
      },
      "twoImports": {
        "summary": "Two import job requests",
        "value": [
          {
            "id": "bulk-import-id-1",
            "status": "WAIT_PR_APPROVAL",
            "errors": [],
            "lastUpdatedAt": 1711529803,
            "approvalTool": "GIT",
            "repository": {
              "name": "pet-app",
              "url": "https://github.com/my-org/pet-app",
              "organization": "https://github.com/my-org"
            },
            "github": {
              "pullRequest": {
                "url": "https://github.com/my-org/pet-app/pull/1"
              }
            }
          },
          {
            "id": "bulk-import-id-2",
            "status": "PR_REJECTED",
            "errors": [],
            "lastUpdatedAt": 1611529803,
            "approvalTool": "GIT",
            "repository": {
              "name": "pet-app-test",
              "url": "https://github.com/my-org/pet-app-test",
              "organization": "https://github.com/my-org"
            },
            "github": {
              "pullRequest": {
                "url": "https://github.com/my-org/pet-app-test/pull/10"
              }
            }
          }
        ]
      },
      "multipleImportRequests": {
        "summary": "Multiple import requests",
        "value": [
          {
            "approvalTool": "GIT",
            "repository": {
              "name": "pet-app",
              "url": "https://github.com/my-org/pet-app",
              "organization": "https://github.com/my-org"
            },
            "github": {
              "pullRequest": {
                "title": "Add default catalog-info.yaml to import to Red Hat Developer Hub"
              }
            }
          },
          {
            "approvalTool": "GIT",
            "repository": {
              "name": "project-zero",
              "url": "https://ghe.example.com/my-other-org/project-zero",
              "organization": "https://ghe.example.com/my-other-org"
            },
            "github": {
              "pullRequest": {
                "title": "Add custom catalog-info.yaml to import to Red Hat Developer Hub",
                "body": "This pull request adds a **Backstage entity metadata file** to this repository so that the component can be added to the Red Hat Developer Hub software catalog.\\n\\nAfter this pull request is merged, the component will become available.\\n\\nFor more information, read an [overview of the Backstage software catalog](https://backstage.io/docs/features/software-catalog/)."
              }
            },
            "catalogInfoContent": "apiVersion: backstage.io/v1alpha1\\nkind: Component\\nmetadata:\\n  name: project-zero\\n  annotations:\\n    github.com/project-slug: my-other-org/project-zero\\n    acme.com/custom-annotation: my-value\\nspec:\\n  type: other\\n  lifecycle: unknown\\n  owner: my-other-org"
          }
        ]
      }
    }
  }
}`
export const openApiDocument = JSON.parse(OPENAPI);
