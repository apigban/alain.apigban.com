---
title: "Disk Passthrough to VM - Method in Proxmox"
date: 2025-03-01T07:51:00+04:00
hero: images/posts/homelab-04/hdd-passthrough.png
menu:
  sidebar:
    name: Disk Passthrough method in Proxmox
    identifier: homelab-proxmox-disk-passthrough
    parent: Homelab
    weight: 10
---
I frequently find myself needing to directly attach physical disks to virtual machines (VMs) in my Proxmox homelab environment. 
Usually due to disk failure or when I need to perform a cold-archive of data.

This is a handy technique when I need to provide a VM with dedicated storage or access to a raw disk. Here's documentation for future me looking for how to replace a disk.

## Prerequisites
* A Proxmox VE (PVE) host with a physical disk available for passthrough.
* A VM configured and running on the PVE host.

## Procedure

#### Identify the Disk's DEVICE-ID
I use the following command to list block devices and their corresponding device IDs:

```bash
    lsblk | awk 'NR==1{print $0" DEVICE-ID(S)"}NR>1{dev=$1;printf $0" ";system("find /dev/disk/by-id -lname \"*"dev"\" -printf \" %p\"");print "";}'
```

This command will output a list of disks, including their `/dev/disk/by-id` paths. These paths are persistent and more reliable than using device names like `/dev/sda`.

For example, adding a `grep TOS` filter will limit the results to Toshiba HDDs:

```bash
    root@proxmox:~# lsblk | awk 'NR==1{print $0" DEVICE-ID(S)"}NR>1{dev=$1;printf $0" ";system("find /dev/disk/by-id -lname \"*"dev"\" -printf \" %p\"");print "";}' | grep TOS
    sdb     8:16   0   3.6T  0 disk   /dev/disk/by-id/wwn-YYYYYYYYY /dev/disk/by-id/ata-TOSHIBA_HDWG440_YYYYYYYYY
    sdj     8:144  0   3.6T  0 disk   /dev/disk/by-id/wwn-XXXXXXXXXX /dev/disk/by-id/ata-TOSHIBA_HDWG440_XXXXXXXXXX
```

#### Add the Physical Disk as a Virtual SCSI Disk
{{< img src="/posts/shortcodes/hdd-pic-02.png" align="center" title="vm-details" >}}
{{< vs 3 >}}
To attach the disk to the VM, I use the qm set command. I would replace <VM-ID> with the VM's ID, <NUMBER> with an available SCSI controller number, and <DEVICE-ID> with the device ID of the physical disk:

```bash
    qm set <VM-ID> -scsi<NUMBER> /dev/disk/by-id/<DEVICE-ID>
```
For example, to attach the disk with device ID ata-WDC_WD10EFRX-68FYTN0_WD-ZZZZZZZZ to VM with ID 609 as SCSI device 11, I would use:

```bash
    qm set 609 -scsi11 /dev/disk/by-id/ata-WDC_WD10EFRX-68FYTN0_WD-SERIALNUMBER
```

## Verification

After attaching the disk, I log in to the VM and verify that the disk is recognized. Tools like lsblk or blkid within the VM to confirm its presence will help here.
