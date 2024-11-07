---
---
# Homelab

My homelab is mostly contained within a 42U Enclosed server rack that contains the following hardware:

- [Ubiquity UDM Pro](https://store.ui.com/us/en/products/udm-pro)
- [Dell PowerEdge R720xd x2 E2690v2 256GB ECC 1800mhz RAM](https://i.dell.com/sites/content/shared-content/data-sheets/en/Documents/Dell-PowerEdge-R720xd-Spec-Sheet.pdf)
- [Raspberry Pi 4b 8GB RAM](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/)

![](/img/setup/setup-homelab-cabinet-open.jpg)

## ProxMox

I run [ProxMox VE](https://pve.proxmox.com/wiki/Main_Page) on my [Dell PE R720xd](https://i.dell.com/sites/content/shared-content/data-sheets/en/Documents/Dell-PowerEdge-R720xd-Spec-Sheet.pdf) that I configure and deploy with terraform and ansible stored in my [Github TechDufus Home.io](https://github.com/techdufus/home.io) repository. Here I store all the config needed to configure ProxMox itself, as well as any VMs to be stood up and deployed.
