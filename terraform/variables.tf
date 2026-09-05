variable "aws_region" {
  description = "AWS Region to deploy to"
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 Instance Type for Kubernetes Nodes"
  default     = "t3.medium" 
}

variable "key_name" {
  description = "Name of the existing AWS SSH Key Pair"
  default     = "k8s-key"
}
