---
title: Testing Terraform IaC with Pester - Unit Tests
description: >-
  I'm always reminded how excited I am to be in the technology space, because
  the things there are to learn are pretty awesome.
pubDate: '2021-05-31'
tags:
  - devops
  - tutorial
category: tech
---
# Welcome back! Today I wanted to talk about a new concept I was exposed to recently, testing your terraform infrastructure-as-code using Pester.

I'm always reminded how excited I am to be in the technology space, because the things there are to learn are pretty awesome.

## What is Infrastructure as Code?

For anyone who hasn't been exposed to the term 'Infrastructure as Code' (IaC), this is basically a declarative way to define what infrastructure you want in your environment, and the configuration code is consumed by an engine to 'make it so'. Here are a few examples of IaC tools:

+ Terraform
+ AWS CloudFormation
+ Azure ARM
+ Chef
+ SaltStack
+ And much much more..

Terraform is an engine that consumes configuration files written in HashiCorp Configuration Language (HCL) to create infrastructure. Though, HCL by itself is not enough, you also need to choose a provider. A provider is basically a translator that interprets the HCL config against the target platform of the provider.

For example, If you want to use Terraform to manage infrastructure in Azure, you would use the AzureRM provider. This allows you to write your HCL config, and the AzureRM provider knows how to translate that to all the azure-specific resources. The same applies to AWS, VMWare, etc.. Anywhere there's a provider written, you'll be able to keep your HCL syntax, and the provider takes care of the nuances of that platform.

ANYWAY, recently I've been using terraform to create entire Azure environments, including all of the networking, VPN connections to our on-prem datacenters, and all of this for each of our environments, (dev, test, prod, etc.)

With all of this infrastructure  living inside of config files, we can easily get them into source control, like `git`. If I make an infrastructure change in terraform that ultimately breaks something, I can easily revert to the previous working configuration using `git`.

## Why should we test our Infrastructure?

The idea of writing unit / integration tests for your infrastructure is an idea that may be hard to grasp at first, but once you see the value, it will be hard to go back. 😊

Having testing in place should inherently provide confidence in the changes that you make. Instead of making and change and hoping things will work out, or having to guess and blindly confirm after the fact if things are working, you can proactively catch issues by writing effective and thorough tests ahead of time.

Would you rather have a test tell you something is broken, or your end users? I thought so..

## Basic Terraform Configuration

In this example, I will be deploying a single virtual machine to an Azure subscription. This involved defining the following essential resources:

+ Provider
+ Resource Group
+ Virtual Network
  + IP Range
+ Virtual Subnet
  + IP Range
+ Virtual Machine
  + OS Type
  + Disk Size / Type
+ Network Interface Card (NIC)
  + IP Config (Static vs Dynamic)

Let's define these one at a time.

### Terraform Provider

The following code will go into your `main.ft` file. I will make some references to variables, which we will define later in our `variables.tf` file.

We first need to tell terraform what providers are required, and then define what version of that provider we want to use.

#### main.tf

```terraform
terraform {
    required_providers {
        #Define the azurerm minimum version and source
        azurerm = {
            source  = "hashicorp/azurerm"
            version = ">= 2.26"
        }
    }

    #Define the minimum terraform version
    required_version = ">=0.15.0"
}

provider "azurerm" {
    #Use the subscription id defined in our terraform variables files.
    subscription_id = var.azure_subscription_id
    features {} #This empty block is required for some reason. :)
}
```

### Terraform Resource Group

Next, let's add to this `main.tf` file to add the configuration for our resource group. For this example, I will be creating a new resource group.

#### main.tf

```terraform
resource "azurerm_resource_group" "rg" {
    name     = var.resource_group_name
    location = var.region
}
```

Here, we are telling terraform (from our variables) what the name and region we want for this resource group. Because we configured our provider with the specific subscription Id, we do not need to specify that elsewhere.

### Terraform Virtual Network

Now let's define an IP range for the virtual network that our resources will use. This may be overkill for a single VM, but if we wanted to add more VMs, we've already carved out our desired IP range for this here. :)

#### main.tf

```terraform
resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-testing-terraform"
  address_space       = var.vnet.address_space
  location            = var.region
  resource_group_name = azurerm_resource_group.rg.name
}
```

### Terraform Subnet

This subnet will be a smaller IP range that lives on the Virtual Network we just defined.

#### main.tf

```terraform
resource "azurerm_subnet" "vms_subnet" {
  name                 = var.subnet.vms.subnet_name
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = var.subnet.vms.address_prefixes
}
```

### Terraform Virtual Machine

Here we have a bit more configuration to provide.

#### main.tf

```terraform
resource "azurerm_virtual_machine" "vm" {
  name                  = var.vm1_name
  location              = var.region
  resource_group_name   = azurerm_resource_group.rg.name
  network_interface_ids = [azurerm_network_interface.vm_nic.id]
  vm_size               = "Standard_DS1_v2"

  storage_os_disk {
    name              = "${var.vm1_name}_OsDisk_C"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
    disk_size_gb      = 256
  }

  storage_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2019-Datacenter"
    version   = "latest"
  }

  os_profile {
    computer_name  = terraform_vm
    admin_username = var.admin_username
    admin_password = var.admin_password
  }

  os_profile_windows_config {
    provision_vm_agent = true
  }
}
```

### Terraform NIC

The IP for this NIC will live on the subnet range we just created.

#### main.tf

```terraform
resource "azurerm_network_interface" "vm_nic" {
  name                = "${var.vm1_name}_nic"
  location            = var.region
  resource_group_name = azurerm_resource_group.rg.name


  ip_configuration {
    name                          = "${var.vm1_name}_nic"
    subnet_id                     = azurerm_subnet.vms_subnet.id
    private_ip_address_allocation = dynamic
  }
}
```

### Terraform Variables

Now let's define our variables for this `main.tf` configuration.

#### variables.tf

```terraform
variable "region" {
    type        = string
    description = "Declare the azure region for your resources."
}

variable "azure_subscription_id" {
  type        = string
  description = "Azure Subscription ID"
}

variable "resource_group_name" {
  type        = string
  description = "Declare the resource group for this environment"
}

variable "vm1_name" {
  type        = string
  description = "Declare name of vm"
}

variable "vnet" {
  type = object({
    address_space = list(string)
  })
}

variable "subnet" {
  type = map(object({
    subnet_name      = string
    address_prefixes = list(string)
  }))
  description = "Provide an object with the subnet type name and ip range"
}

variable "admin_username" {
  type        = string
  description = "Administrator user name for virtual machine"
  sensitive   = false
}

variable "admin_password" {
  type        = string
  description = "Password must meet Azure complexity requirements"
  sensitive   = true
}
```

Lastly, we need a file that terraform automatically imports with variable values. it can be named anything but must end with `.auto.tfvars`

#### demo.auto.tfvars

```terraform
region                = "centralus"
admin_username        = "Administrator"
admin_password        = "Thisismysupersecretpassword1!"
azure_subscription_id = "<YOUR SUBSCRIPTION ID HERE>"
resource_group_name   = "Terraform-Testing-RG"
vm1_name              = "Terraform-VM"

vnet = {
  address_space = ["10.0.4.0/24"]
}

subnet = {
  vms = {
    subnet_name      = "vms_subnet"
    address_prefixes = ["10.0.4.0/27"]
  }
}
```

## Let's Start Testing

Now that we have our basic resources defined, it's time to finally jump into Pester and write some tests for this configuration.

**Note:** All Pester code shown in this post will be valid for Pester v5.2.0

### Setup the Terraform `$Plan`

Let's create a test file in the same directory called `terraform.tests.ps1` which will be our Pester tests file.

#### terraform.tests.ps1

```powershell
Describe 'Terraform Blog Demo Tests' {
    BeforeAll -ErrorAction Stop {
        Write-Host "Test Case: Blog Demo" -ForegroundColor Magenta
        Write-Host 'Initializing...'
        terraform init
        Write-Host 'Validating...'
        terraform validate
        Write-Host 'Planning...'
        (terraform plan -out terraform.plan)

        #Parse plan file and pull out provided variables
        $Plan = terraform show -json terraform.plan | ConvertFrom-Json
        $Variables = $Plan.Variables
    }

    Context 'Unit' -Tag Unit {

    }

    Context 'Integration' -Tag Integration {

    }
}
```

Notice the initial `BeforeAll` section. We will need to have terraform do a little prep for us before we can start testing. Terraform has a `plan` command, which is basically terraform saying 'IF I was to create this infrastructure, these are the exact actions I would take'. This is the basis of our tests. We want to create tests to confirm that terraform says it will do exactly what we say it should do. These will be put into the `Unit` test section. We will simply be testing the code itself.

The essential part of this `BeforeAll` section is `$Plan = terraform show -json terraform.plan | ConvertFrom-Json`. This takes the JSON output of the plan file and converts it to a PowerShell object that we can play with.

### Extracting the `$Plan`'s plans

Let's add the following code inside the `Unit` context.

#### terraform.tests.ps1

```powershell
Describe ... {
    BeforeAll {
        ...
    }

    Context 'Unit' -Tag Unit {
        BeforeAll {
            $ResourceGroupAddress  = 'azurerm_resource_group.rg'
            $VirtualNetworkAddress = 'azurerm_virtual_network.vnet'
            $VmsSubnetAddress      = 'azurerm_subnet.vms_subnet'
            $VirtualMachineAddress = 'azurerm_virtual_machine.vm'
            $VmNicAddress          = 'azurerm_network_interface.vm_nic'

            $ResourceGroupPlan  = ($Plan.resource_changes | Where-Object { $_.address -eq $ResourceGroupAddress })[0]
            $VirtualNetworkPlan = ($Plan.resource_changes | Where-Object { $_.address -eq $VirtualNetworkAddress })[0]
            $VmsSubnetPlan      = ($Plan.resource_changes | Where-Object { $_.address -eq $VmsSubnetAddress})[0]
            $VirtualMachinePlan = ($Plan.resource_changes | Where-Object { $_.address -eq $VirtualMachineAddress})[0]
            $VmNicPlan          = ($Plan.resource_changes | Where-Object { $_.address -eq $VmNicAddress})[0]
        }
    }
}
```

This section lets us target the exact objects in the `$Plan.resource_changes` object that terraform plans to change / create / etc. Once we have extracted that plan information, we can run some tests on them to confirm some things.

### Testing the `$Plan`

We will create new `It` test blocks for each test we want to perform. Let's add a few basic tests.

#### terraform.tests.ps1
```powershell
Describe ... {
    BeforeAll {
        ...
    }

    Context 'Unit' -Tag Unit {
        BeforeAll {
            ...
        }

        #Region Resource Group Tests
        It 'Will create resource_group' {
            $ResourceGroupPlan.change.actions[0] | Should -Be 'create'
        }
        
        It 'Will create resource_group with correct name' {
            $ResourceGroupPlan.change.after.name | Should -Be $Variables.resource_group_name.value
        }
        
        It 'Will create resource_group in correct region' {
            $ResourceGroupPlan.change.after.location | Should -Be $Variables.region.value
        }
        #EndRegion Resource Group Tests

        #Region Virtual Network Tests
        It 'Will create virtual_network' {
            $VirtualNetworkPlan.change.actions[0] | Should -Be 'create'
        }
        
        It 'Will create virtual_network in correct region' {
            $VirtualNetworkPlan.change.after.location | Should -Be $Variables.region.value
        }

        It 'Will create virtual_network with correct address_space' {
            $VirtualNetworkPlan.change.after.address_space | Should -Be $Variables.vnet.value.address_space
        }

        It 'Will create virtual_network in correct resource group' {
            $VirtualNetworkPlan.change.after.resource_group_name | Should -Be $Variables.resource_group_name.value
        }
        #EndRegion Virtual Network Tests

        #Region Vms Subnet Tests
        It 'Will create subnet' {
            $VmsSubnetPlan.change.actions[0] | Should -Be 'create'
        }

        It 'Will assign correct subnet IP Range' {
            $VariableAddressPrefixes = $Variables.subnet.value.vms.address_prefixes
            $VmsSubnetPlan.change.after.address_prefixes | Should -Be $VariableAddressPrefixes
        }
        #EndRegion Vms Subnet Tests

        #Region Virtual Machine Tests
        It 'Will create vm' {
            $VirtualMachinePlan.change.actions[0] | Should -Be 'create'
        }

        It 'Will create vm in correct resource group' {
            $VirtualMachinePlan.change.after.resource_group_name | Should -Be $Variables.resource_group_name.value
        }

        It 'Will create vm in correct region' {
            $VirtualMachinePlan.change.after.location | Should -Be $Variables.region.value
        }

        It 'Will assign vm correct administrator username' {
            $VirtualMachinePlan.change.after.os_profile.admin_username | Should -Be $Variables.admin_username.value
        }

        It 'Will assign vm correct administrator password' {
            $VirtualMachinePlan.change.after.os_profile.admin_password | Should -Be $Variables.admin_password.value
        }

        It 'Will provision_vm_agent for vm' {
            $VirtualMachinePlan.change.after.os_profile_windows_config.provision_vm_agent | Should -Be $true
        }
        
        It 'Will not enable_automatic_upgrades for vm' {
            $VirtualMachinePlan.change.after.os_profile_windows_config.enable_automatic_upgrades | Should -Be $false
        }
        #EndRegion Virtual Machine Tests

        #Region NIC Tests        
        It 'Will create vm_nic' {
            $VmNicPlan.change.actions[0] | Should -Be 'create'
        }

        It 'Will create vm_nic in correct resource group' {
            $VmNicPlan.change.after.resource_group_name | Should -Be $Variables.resource_group_name.value
        }

        It 'Will create vm_nic in correct region' {
            $VmNicPlan.change.after.location | Should -Be $Variables.region.value
        }

        It 'Will assign dynamic address allocation' {
            $VmNicPlan.change.after.ip_configuration.private_ip_address_allocation | Should -Be 'dynamic'
        }

        It 'Will assign an IPv4 address to vm_nic' {
            $VmNicPlan.change.after.ip_configuration.private_ip_address_version | Should -Be 'IPv4'
        }
        #EndRegion NIC Tests
    }
}
```

### Running the Tests

These are some simple tests that confirm some of the values that terraform produces based on what our configuration tells terraform to create. We can run `Invoke-Pester Path\to\terraform.tests.ps1 -Output Detailed` to confirm that our tests and code are all correct. These tests should all pass. If not, feel free to troubleshoot. After all, that's the whole point of the tests, if something fails, there's either something wrong with the test or something wrong with the code.

Here's my output of these tests.

![](/img/posts/terraform_passed_pester_tests.png)

## In Summary

Terraform, or any IaC for that matter is a fantastic tool to add to your tech stack. I realized this post was getting a bit long with all of the tests, so I decided to end this post here, having covered some basic concepts about Unit testing and will continue in a 2nd post that will cover Integration testing.

Integration tests differ from Unit tests in that, Unit tests test the code itself, but Integration tests actually apply the code, and test the real-world result. In the next post, we will actually have terraform create this infrastructure in Azure, and will continue to leverage Pester to confirm that terraform correctly created what we said it should. Additionally, if you have some front-end / back-end infrastructure, you can have Pester test all kinds of connection types, ports, etc. Not only can you test that the VM is there, we can confirm that our networking is all in place, that different resources can properly talk to each other, and what ever else you need to test in your environment.

Until next time, thanks for checking out my content! If you have any feedback, or just want to let me know you liked or disliked something I wrote, PLEASE reach out! 😊
