output "frontend_url" {
  description = "URL pública del frontend desplegado"
  value       = azurerm_container_app.frontend.latest_revision_fqdn
}