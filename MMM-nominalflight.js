/* Magic Mirror
 * Module: MMM-spacelaunch
 *
 * By Jonas Studer http://jonasstuder.com
 * MIT Licensed.
 */

Module.register("MMM-nominalflight",{
	// Default module config.
	defaults: {
		apiVersion: "1.0",
		apiBase: "https://nominalflight.appspot.com/api/launches/",
		launches: 5,
		updateInterval: 60 * 60 * 1000, // every 60 minutes
		animationSpeed: 1000,
		initialLoadDelay: 1000,
		retryDelay: 2000,
		showMission: false,
		showHighlight: true,
		maxWidth: "",
	},
	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function() {
		return ["MMM-nominalflight.css"];
	},

	// Define required translations.
	getTranslations: function() {
		// The translations for the defaut modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionairy.
		// If you're trying to build yiur own module including translations, check out the documentation.
		return false;
	},
	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);
		this.launches = [];
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.updateTimer = null;
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var table = document.createElement("table");
		table.className = "small";
		if(this.config.maxWidth != ""){
			table.style.maxWidth = this.config.maxWidth;
		}

		for (var l in this.launches) {
			var launch = this.launches[l];

			var row = document.createElement("tr");
			if(l>0){
				row.className = "nominalflight_row";	
			}
			table.appendChild(row);

			var dateCell = document.createElement("td");
			if(this.config.maxWidth != ""){
				dateCell.className = "rocketpad nominalflight_datecell";
			} else {
				dateCell.className = "rocketpad";
			}
			dateCell.innerHTML = launch.net_show();
			row.appendChild(dateCell);

			var mainnameCell = document.createElement("td");
			mainnameCell.innerHTML = launch.launch_name;
			mainnameCell.className = "bright";
			row.appendChild(mainnameCell);

			if(launch.highlight && this.config.showHighlight){
				var timerow = document.createElement("tr");
				timerow.className = "nominalflight_timerow";
				table.appendChild(timerow);

				var dateCell = document.createElement("td");
				dateCell.className = "align-right rocketpad";
				dateCell.innerHTML = launch.net_time(); //launch.net_show;
				timerow.appendChild(dateCell);

				var mainCell = document.createElement("td");
				mainCell.innerHTML = launch.location_name;
				mainCell.className = "";
				timerow.appendChild(mainCell);

				if(this.config.showMission){
					var missionrow = document.createElement("tr");
					missionrow.className = "nominalflight_missionrow";
					table.appendChild(missionrow);

					var emptyCell = document.createElement("td");
					missionrow.appendChild(emptyCell);

					var missioncol = document.createElement("td");
					missioncol.className = "xsmall dimmed missiondescription";
					missionrow.appendChild(missioncol);
					
					for (var i in launch.mission_descriptions) {
						var missionp = document.createElement("p");		
						missionp.innerHTML = launch.mission_descriptions[i];
						missioncol.appendChild(missionp);
					}
				}
				
				var agencyrow = document.createElement("tr");
				table.appendChild(agencyrow);

				var emptyCell = document.createElement("td");
				agencyrow.appendChild(emptyCell);

				var agentCell = document.createElement("td");
				agentCell.className = "xsmall agencyrow";
				agentCell.innerHTML = launch.agencies;
				agencyrow.appendChild(agentCell);
			}
		}
		return table
	},

	getHeader: function() {
		return this.data.header;
	},

	updateLaunches: function() {
		var url = this.config.apiBase + this.config.launches + '.json'
		var retry = true;
		this.sendSocketNotification('LAUNCH_UPDATE', url);
	},

	/* processLaunches(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Launch information received from launchlibrary.net.
	 */
	processLaunches: function(data) {
		this.launches = [];
		for (var i = 0, count = data.launches.length; i < count; i++) {
			var launch = data.launches[i];
			var self = this;
			self.launches.push({
				launch_name : launch.name,
				raw_date: launch.netdate,
				net_short : launch.net_short,
				highlight : launch.highlight,
				tbddate : launch.tbddate,
				tbdtime : launch.tbdtime,
				location_name : launch.location_name,
				agencies : launch.agencies,
				mission_descriptions : launch.mission_descriptions,
				netdate: function() {
					var netdateutc = moment.utc(this.raw_date);
					return moment(netdateutc).local();						
				},
				net_show: function() {
					netdate = this.netdate();
					var md = netdate.format('MMM');
					if(this.tbddate==0){
						md+= netdate.format(' D');
					}
					return md;
				},
				net_time: function(){
					var x = "";
					if(this.tbdtime==0){
						x = this.netdate().format("HH:mm");
					}
					return x
				}
			});
		}
		this.show(this.config.animationSpeed, {lockString:this.identifier});
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function() {
			self.updateLaunches();
		}, nextLoad);
	},
  	socketNotificationReceived: function(notification, payload) {
      	if (notification === 'LAUNCH_DATA') {
        	Log.info('received LAUNCH_DATA');
			this.processLaunches(payload);
      	}
  	},
	convertUtc2Local: function(netdate) {
		var netdateutc = moment.utc(netdate);
		return moment(netdateutc).local();		
	}
});
