# visual-eq
**AllTWay Visual EQ for Raspberry PI**

This project is a visual equalizer that runs on a nodejs server in a raspberry pi, the visualiser is rendered through [P5.js](https://p5js.org/ "Processing JS")

- [visual-eq](#visual-eq)
  - [Installing Node](#installing-node)
  - [Running a node server on startup](#running-a-node-server-on-startup)
  - [Booting Chromium into kiosk mode on start up](#booting-chromium-into-kiosk-mode-on-start-up)
  - [Monitoring the system...](#monitoring-the-system)
    - [Disk space usage:](#disk-space-usage)
    - [Cpu and memory usage:](#cpu-and-memory-usage)
  - [PM2](#pm2)
    - [Installing PM2](#installing-pm2)
    - [Starting your server through PM2](#starting-your-server-through-pm2)
    - [List running apps](#list-running-apps)
    - [Monitor all apps](#monitor-all-apps)
    - [Startup script](#startup-script)
  - [Mopidy](#mopidy)
    - [Install Mopidy](#install-mopidy)
    - [Mopidy-Spotify](#mopidy-spotify)
    - [Mopidy-Mopify](#mopidy-mopify)
    - [Starting the service](#starting-the-service)
  - [Other Issues](#other-issues)
    - [Temporary failure resolving...](#temporary-failure-resolving)
  

To-Do:
- [X] HTML/JS FFT Renderer
- [X] Node.js server running the visual eq
- [ ] Spotify Integration
- [ ] Artist/Song information option


## Installing Node


Update the package manager.
```
sudo apt update
```
The apt update command doesn't actually update anything, it just downloads the most up to date packages. So to install them, run:
```
sudo apt full-upgrade
```

Once the package manager is up to date, you can go ahead and download Node, followed by the install command.

```
sudo apt-get install nodejs
```
To verify your node version type:
```
node -v
```

## Running a node server on startup

Before we can run the Node server you will need to have the application installed on your Pi. Presuming you have your project on github already, you can get its https address and clone it into your Pi's home folder using the following command.
```
https://github.com/migmac99/visual-eq.git
```


Next, change directory into that folder using the following commands to install all of your projects dependencies.

```
cd /home/pi/visual-eq
```
```
npm install
```

Now, make sure everything is working by starting up your Node server. Usually this is the command `node server` but it may be `npm start`.
```
node server
```

Once your server is running, you can go ahead and create a server file. Create this in the systemd directory using the following command:
```
sudo nano /etc/systemd/system/node-server.service
```
Then add the following code replacing the path to `visual-eq` in the WorkingDirectory and ExecStart lines with the path to your Node application. The Exec start line in the example is the equivalent to running the command `node server.js` so you may need to change this to `ExecStart=/usr/bin/npm start` if you start your project with the `npm start` command.
```
[Service]
WorkingDirectory=/home/pi/some_awesome_project
ExecStart=/usr/local/bin/node --expose-gc /home/pi/some_awesome_project/server.js
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=nodeServer
User=root
Group=root
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
Exit nano with `ctrl + x` and press `Y` to save the file. You can then activate the system file with the following command:
```
sudo systemctl enable node-server
```

To check that it worked, reboot your Pi using `sudo reboot` and once it has loaded back up, use the browser navigate to the port that your server usually runs on, eg: `http://localhost:8000` and you should see your Node application running.

## Booting Chromium into kiosk mode on start up

The last step in the process is to boot the chromium-browser into kiosk mode to show your Node application full screen. To do this you need to add one line of code to the autostart file. To edit your autostart file, use the following command:
```
sudo nano /home/pi/.config/lxsession/LXDE-pi/autostart
```
If this returns `home/pi/.config/lxsession/autostart does not exist` then try the following:
```
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
```

```
```

The first 3 lines prevent screen blanking - for one project I am using a touch screen so these could be removed to preserve life and make it wake on touch.

The `sed` line ensures chromium thinks it shut down cleaning, even if it didn't to prevent tab restore warnings.

```
@xset s off
@xset -dpms
@xset s noblank
@sed -i 's/"exited_cleanly": false/"exited_cleanly": true/' ~/.config/chromium-browser Default/Preferences
```

Add the following line to the bottom of the file. 
 
* `--kiosk` Removes the frame and makes it full screen.
* `--incognito` Means that it doesn't remember sessions, so if you pull the power chord out of your Pi, you won't get a warning next time you boot up Chromium.
* `--noerrdialogs` Suppresses all error dialogs when present.
* More arguments can be found [here](https://peter.sh/experiments/chromium-command-line-switches/ "List of Chromium Command Line Switches") 
 
> Remember to change the port to whatever your node server is running on. If you're not running a node server, you can change the http address to any website address.
```
@chromium-browser --noerrdialogs --kiosk http://localhost:8000 --incognito
```
If you want to remove the mouse pointer you can install unclutter and again add that to the autostart file. Install unclutter using the following command:
```
sudo apt-get install unclutter
```
Again, open your autostart file:
```
nano /home/pi/.config/lxsession/LXDE-pi/autostart
```
If this returns `home/pi/.config/lxsession/autostart does not exist` then try the following:
```
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
```

and add the following line to the bottom:
```
@unclutter -idle 0.1 -root
```

My final file consisted of this:
```
@xset s off
@xset -dpms
@xset s noblank
@sed -i 's/"exited_cleanly": false/"exited_cleanly": true/' ~/.config/chromium-browser Default/Preferences
@chromium-browser --noerrdialogs --kiosk http://localhost:8000 --incognito
@unclutter -idle 0.1 -root
```

## Monitoring the system...

### Disk space usage:
```
watch -n 1 df -h
```
`-n 1` is the time between refreshes
`-h` displays units in `K | M | G` instead of bytes 

### Cpu and memory usage:
```
htop
```


## PM2

### Installing PM2

I am using pm2 to monitor and auto-start the node.js server on startup.

Install pm2
```
sudo npm install pm2 -g
```

If you can't install pm2 because of an outdated npm version try updating to the latest npm by doing `sudo npm install npm@latest -g`

### Starting your server through PM2
Make sure you are in the directory of the project `cd visual-eq`
* `--watch` will automatically watch & restart the app on any file change from the current directory + all subfolders
```
pm2 start server.js --watch
```

### List running apps
Use this to list all current apps on pm2 and respective status
```
pm2 [list|ls|status]
```

### Monitor all apps
Use this to live monitor any apps terminal feeds
```
pm2 monit
```
### Startup script
Restarting PM2 with the processes you manage on server boot/reboot is critical. To solve this, just run this command to generate an active startup script:
```
pm2 startup
```
To execute the Startup Script, copy/paste the given command (after doing `pm2 startup`)

And to freeze a process list for automatic respawn:
```
pm2 save
```

## Mopidy
Mopidy is an extensible music server written in Python.


### Install Mopidy

To install mopidy do this:

Add the gpg key of the archive
```
wget -q -O - https://apt.mopidy.com/mopidy.gpg | sudo apt-key add -
```
Add the repository to your package sources
```
sudo wget -q -O /etc/apt/sources.list.d/mopidy.list https://apt.mopidy.com/jessie.list
```
Update your package sources
```
sudo apt-get update
```
Install mopidy
```
sudo apt-get install mopidy
```

Add this to the end of `mopidy.conf` by doing
```
sudo nano /etc/mopidy/mopidy.conf
```
```
[http]
enabled = true
hostname = 0.0.0.0
port = 6680
```

### Mopidy-Spotify

```
sudo apt-get install mopidy-spotify
```

Add this to the end of `mopidy.conf` by doing
```
sudo nano /etc/mopidy/mopidy.conf
```
```
[spotify]
enabled = true
username = <your spotify username>
password = <your spotify password>
client_id = <your client id>
client_secret = <your client secret>
```

To check your client_id and cient_secret, go [here](https://mopidy.com/ext/spotify/#authentication)

### Mopidy-Mopify

we need pip (python package manager) for this
```
sudo apt-get install python-pip
```
After the pip installation do:
```
sudo pip install Mopidy-Mopify
```
Add this to the end of `mopidy.conf` by doing
```
sudo nano /etc/mopidy/mopidy.conf
```
```
[mopify]
enabled = true
debug = false
```

### Starting the service

Reload the services by doing
```
sudo systemctl daemon-reload
```
Enable mopify
```
sudo systemctl enable mopidy
```
Start the service
```
sudo systemctl start mopidy
```
After this do `sudo reboot` to reboot your system to check that mopidy starts automatically when booted.

Once booted, to check service status do:
```
sudo systemctl status mopidy
```




## Other Issues

### Temporary failure resolving...
I couldn't apt-get while running ssh.
I found the answer to my problem in a forum. It's a DNS problem;
On the command line type:
```
sudo nano /etc/resolv.conf
```
and then add the lines to the file:
```
nameserver 8.8.8.8
nameserver 8.8.4.4
```
> (Google DNS)