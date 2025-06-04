variable "resource_group_name" {
  description = "Triage Web Group"
  type        = string
}

variable "location" {
  description = "Región de Azure donde se desplegará la infraestructura"
  type        = string
  default     = "brazilsouth"
}

variable "acr_name" {
  description = "Triage Web ACR"
  type        = string
}

variable "mongodb_uri" {
  description = "URI del cluster MongoDB utilizado por la app"
  type        = string
}

variable "python_url" {
  description = "URL del servicio Python que procesa los datos"
  type        = string
}