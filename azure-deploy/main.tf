provider "azurerm" {
  features {}
}

provider "docker" {
  registry_auth {
    address  = azurerm_container_registry.acr.login_server
    username = azurerm_container_registry.acr.admin_username
    password = azurerm_container_registry.acr.admin_password
  }
}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_container_app_environment" "env" {
  name                = "triage-env"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_container_app" "frontend" {
  name                         = "triage-frontend"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location

  template {
    container {
      name   = "frontend"
      image  = "${azurerm_container_registry.acr.login_server}/triage-frontend:latest"
      resources {
        cpu    = 0.5
        memory = "1.0Gi"
      }
    }
    ingress {
      external_enabled = true
      target_port      = 80
    }
  }
  registry {
    server   = azurerm_container_registry.acr.login_server
    username = azurerm_container_registry.acr.admin_username
    password = azurerm_container_registry.acr.admin_password
  }
}

resource "azurerm_container_app" "backend" {
  name                         = "triage-backend"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location

  template {
    container {
      name   = "backend"
      image  = "${azurerm_container_registry.acr.login_server}/triage-backend:latest"
      resources {
        cpu    = 0.5
        memory = "1.0Gi"
      }
      env {
        name  = "MONGODB_URI"
        value = var.mongodb_uri
      }
      env {
        name  = "PYTHON_URL"
        value = "http://triage-python:3002/processData"
      }
    }
    ingress {
      external_enabled = false
      target_port      = 3000
    }
  }
  registry {
    server   = azurerm_container_registry.acr.login_server
    username = azurerm_container_registry.acr.admin_username
    password = azurerm_container_registry.acr.admin_password
  }
}

resource "azurerm_container_app" "python" {
  name                         = "triage-python"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location

  template {
    container {
      name   = "python"
      image  = "${azurerm_container_registry.acr.login_server}/triage-python:latest"
      resources {
        cpu    = 0.5
        memory = "1.0Gi"
      }
    }
    ingress {
      external_enabled = false
      target_port      = 3002
    }
  }
  registry {
    server   = azurerm_container_registry.acr.login_server
    username = azurerm_container_registry.acr.admin_username
    password = azurerm_container_registry.acr.admin_password
  }
}