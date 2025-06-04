output "frontend_url" {
  description = "URL pública del frontend"
  value       = "https://${azurerm_container_app.frontend.ingress[0].fqdn}"
}

output "backend_url" {
  description = "URL pública del backend"
  value       = "https://${azurerm_container_app.backend.ingress[0].fqdn}"
}

output "python_url" {
  description = "URL pública del microservicio Python"
  value       = "https://${azurerm_container_app.python.ingress[0].fqdn}"
}
