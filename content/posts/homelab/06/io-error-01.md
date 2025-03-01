---
title: "2025-02-27 - Another i/o Error for storage01"
date: 2025-03-02T00:16:00+04:00
hero: images/posts/homelab-06/io-error-img-01.png
menu:
  sidebar:
    name: i/o Error for storage01
    identifier: io-error-01
    parent: Homelab
    weight: 10
---
Another disk issue on `storage01` and I haven't done documenting the fault that happened last February 21, 2025.

{{< img src="/posts/shortcodes/kratos.gif" height="200" align="center" title="angry kratos" >}}
{{< vs 3 >}}
#### Incident
*  I/O Error on `/dev/sdb1` during scrub operation.

#### Severity
* High

#### Impact
* Data corruption on `/dev/sdb1`, potential data loss
* `sdb1` is one branch of the mergerfs volume served by `storage01`, losing access to `sdb1` effectively halves the usable capacity of the Network File System

#### Affected Systems
* `storage01`

#### Timeline
* 2025-02-27: I/O errors detected during snapraid scrub operation.
* 2025-02-27: XFS filesystem on `/dev/sdb1` shuts down due to log I/O errors.
* 2025-03-01: Troubleshooting steps initiated to identify the root cause.

#### Logs from dmesg
```bash
    [145729.843018] sd 1:0:0:10: [sdb] tag#84 Sense Key : Aborted Command [current]
    [145729.843019] sd 1:0:0:10: [sdb] tag#84 Add. Sense: I/O process terminated
    [145729.843021] sd 1:0:0:10: [sdb] tag#84 CDB: Synchronize Cache(10) 35 00 00 00 00 00 00 00 00 00
    [145729.843023] I/O error, dev sdb, sector 0 op 0x1:(WRITE) flags 0x800 phys_seg 0 prio class 2
    [145729.850513] sd 1:0:0:10: [sdb] tag#201 FAILED Result: hostbyte=DID_OK driverbyte=DRIVER_OK cmd_age=0s
    [145729.850517] sd 1:0:0:10: [sdb] tag#201 Sense Key : Aborted Command [current]
    [145729.850518] sd 1:0:0:10: [sdb] tag#201 Add. Sense: I/O process terminated
    [145729.850519] sd 1:0:0:10: [sdb] tag#201 CDB: Synchronize Cache(10) 35 00 00 00 00 00 00 00 00 00
    [145729.850540] I/O error, dev sdb, sector 3909372392 op 0x1:(WRITE) flags 0x9800 phys_seg 1 prio class 2
    [145729.850549] XFS (sdb1): log I/O error -5
    [145729.850569] XFS (sdb1): Log I/O Error (0x2) detected at xlog_ioend_work+0x6e/0x70 [xfs] (fs/xfs/xfs_log.c:1378).  Shutting down filesystem.
    [145729.850749] XFS (sdb1): Please unmount the filesystem and rectify the problem(s)
```

#### Detection
###### Alert from Discord
{{< img src="/posts/shortcodes/io-error-img-03.png" height="300" align="center" title="Discord Notification" >}}
{{< vs 3 >}}
###### Disk Metrics during fault
{{< img src="/posts/shortcodes/io-error-img-02.png" height="500" align="center" title="i/o metrics" >}}
{{< vs 3 >}}
###### Server Power Consumption during fault 
{{< img src="/posts/shortcodes/io-error-img-01.png" height="600" align="center" title="power consumption" >}}
{{< vs 3 >}}

#### Troubleshooting Steps
###### Unmount Attempt
* `umount /dev/sdb1` and `umount /mnt/data01` failed due to the device being busy.
###### Resource Usage Check    
* `fuser -a /mnt/data01` and `lsof /mnt/data01` failed to provide information due to I/O errors.
###### Hardware Intervention
* VM and server stopped.
* SATA cable replaced. Slim SATA data cable was previously used. I've replaced the slim _blue_ SATA cable with a thicker _red_ cable.
* Disk was previously attached to LSI HBA Card. Now I derectly attached it to a free SATA port on the motherboard. 
* Server and VM restarted.

{{< img src="/posts/shortcodes/sata.png" height="400" align="center" title="red cable" >}}
{{< vs 3 >}}





###### XFS Filesystem Repair and Bad Block Check
* `xfs_repair -n /dev/sdb1` run to assess the filesystem without modifications.
* `xfs_repair /dev/sdb1` run to fix detected issues.    
* `badblocks -v -n /dev/sdb` initiated to check for bad blocks on the disk.

##### Current Status

- `badblocks` command is currently running.

```bash
    [root@storage01 ~]# xfs_repair /dev/sdc1
    [root@storage01 ~]# xfs_repair /dev/sdc1
    Phase 1 - find and verify superblock...
    Phase 2 - using internal log
            - zero log...
            - scan filesystem freespace and inode maps...
            - found root inode chunk
    Phase 3 - for each AG...
            - scan and clear agi unlinked lists...
            - process known inodes and perform inode discovery...
            - agno = 0
            - agno = 1
            - agno = 2
            - agno = 3
            - process newly discovered inodes...
    Phase 4 - check for duplicate blocks...
            - setting up duplicate extent list...
            - check for inodes claiming duplicate blocks...
            - agno = 1
            - agno = 2
            - agno = 0
            - agno = 3
    clearing reflink flag on inodes when possible
    Phase 5 - rebuild AG headers and trees...
            - reset superblock...
    Phase 6 - check inode connectivity...
            - resetting contents of realtime bitmap and summary inodes
            - traversing filesystem ...
            - traversal finished ...
            - moving disconnected inodes to lost+found ...
    Phase 7 - verify and correct link counts...
    done

    [root@storage01 ~]# badblocks -v -n /dev/sdc
    Checking for bad blocks in non-destructive read-write mode
    From block 0 to 3907018583
    Testing with random pattern:
```