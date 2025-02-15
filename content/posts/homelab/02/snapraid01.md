---
title: "A NAS was my first impulse purchase for my homelab"
date: 2025-02-15T09:26:00+04:00
hero: images/posts/homelab-02/nas2.png
menu:
  sidebar:
    name: My First NAS
    identifier: homelab-nas
    parent: Homelab
    weight: 10
---
### Initial Homelab Storage Configuration and Limitations

My initial homelab storage solution comprised a RAID5 array utilizing four Toshiba N300 NAS drives within a prebuilt 4-bay NAS. While the low initial cost was a primary factor in the selection, the long-term operational limitations of this configuration became apparent.

{{< img src="/posts/shortcodes/nas1.png" align="center" title="NAS01" >}}

{{< vs 3 >}}

The Realtek RTD1296 ARM-based CPU and limited, non-upgradeable RAM presented significant performance constraints. The Operating System, with its last update for this model in 2023, further restricted functionality. Specifically, the lack of a compatible Tailscale package for the ARM architecture, a desired feature, highlighted the limitations of the older hardware and software. While this prevented direct Tailscale installation on the NAS, it gave me the opportunity to learn how [Tailscale's subnet routing](https://tailscale.com/kb/1019/subnets#install-the-tailscale-client) works.

A critical concern was the lack of user-serviceable components within the NAS. Hardware failure would mean migrating the entire RAID5 array only to an identical model, effectively creating vendor lock-in and restricting future hardware flexibility.

Finally, the NAS' RAID5 implementation, while accommodating disks of varying capacities, presented a significant challenge. The proprietary combination of RAID5 and Logical Volume Management (LVM) meant that I cannot perform a direct migration of the disks to a different system, hindering data portability and recovery options.

### Migration Strategy

Given these limitations, I needed to revise the storage configuration, focusing on data preservation, improved flexibility, and enhanced data integrity. The following steps outline the planned migration:

1.  **Data Backup:** Securely back up all existing data from the pre-built NAS to a temporary storage location.
2.  **Filesystem Reconfiguration:** Reformat the Toshiba N300 drives, removing the existing proprietary RAID5 and LVM configuration.
3.  **Compute Server Integration:** Add the reformatted drives into my primary compute server.
4.  **MergerFS and SnapRAID Implementation:**
    *   Use [MergerFS](https://github.com/trapexit/mergerfs) to create a unified storage pool across the 2 of the NAS drives (2x 4TB drives are pooled), providing flexibility and scalability.
    *   Implement [SnapRAID](https://github.com/amadvance/snapraid/releases) to provide parity-based data protection and bitrot detection. One drive is used for Parity information. This configuration offers a balance between data redundancy and the ability to utilize drives of different sizes.
5.  **Data Restoration:** Restore the backed-up data to the newly configured MergerFS pool.
6.  **Data Validation:** Verify the integrity of the restored data.
7.  **Ongoing Maintenance:** Establish a schedule for regular SnapRAID `sync` and `scrub` operations to maintain data integrity and enable recovery from potential drive failures.

This approach addresses the limitations of the original prebuilt NAS solution, providing a more resilient, flexible, and maintainable storage infrastructure for my homelab data.

The combination of MergerFS and SnapRAID provides a better balance of performance, data protection, and expandability compared to the proprietary RAID5 implementation of the pre-built NAS.

{{< img src="/posts/shortcodes/homelab-storage.png" align="center" title="snapraid-alerts" >}}

{{< vs 3 >}}