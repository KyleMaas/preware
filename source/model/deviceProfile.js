/*global enyo, preware */

enyo.singleton({
	name: "preware.DeviceProfile",
	deviceProfile: false,
	deviceId: false,
	/*events: {
		onDeviceProfileReady: "", //inEvent will have deviceProfile: obj, succes: boolean, message: string.
		onDeviceIdReady: "" //inEvent will have deviceId: obj, success: boolean, message: string
	},*/
	doDeviceProfileReady: function(payload) {
		if (this.callback) {
			this.callback(null, payload); //TODO: rework this into a signal
		}
	},
	doDeviceIdReady: function(payload) {
		if (this.callback) {
			this.callback(null, payload);
		}
	},
	getDeviceProfile: function(callback, reload) {
		this.callback = callback;
		if (this.deviceProfile && !reload) {
			console.error("already had device profile, return stored one.");
			this.doDeviceProfileReady({deviceProfile: this.deviceProfile, success: true, message: ""});
		} else {
			this.deviceProfile = false;
			this.deviceId = false;
			
			console.error("getting device profile from service.");
			preware.IPKGService.impersonate(this._gotDeviceProfile.bind(this),
							"com.palm.configurator",
							"com.palm.deviceprofile",
							"getDeviceProfile", {});
		}
	},
	_gotDeviceProfile: function(payload) {	 
		console.error("Got device profile from service, payload: " + JSON.stringify(payload));
		if (payload.returnValue === true) {
			this.deviceProfile = payload.deviceInfo;
			if (this.deviceProfile.deviceId === "") {
				this.deviceProfile.deviceId = this.deviceProfile.nduId;
			}
			this.doDeviceProfileReady({deviceProfile: this.deviceProfile, success: true, message: ""});
		} else {
			this.doDeviceProfileReady({deviceProfile: false, success: false, message: payload.errorText});
		}
	},
	getDeviceId: function(callback, reload) {
		this.callback = callback;
		if (this.deviceId && !reload) {
			this.doDeviceIdRead({deviceId: this.deviceId, success: true, message: ""});
		} else {
			this.deviceId = false;
			preware.IPKGService.impersonate(this._gotDeviceId.bind(this),
							 "com.palm.configurator",
							 "com.palm.deviceprofile",
							 "getDeviceId", {});
		}
	},
	_gotDeviceId: function(payload) {		
		if (payload.returnValue === false) {
			this.doDeviceIdReady({deviceId: false, success: false, message: payload.errorText});
		} else {
			this.deviceId = payload.deviceId;
			this.doDeviceIdReady({deviceId: this.deviceId, success: true, message: ""});
		}
	}
});