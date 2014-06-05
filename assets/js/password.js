/**
 * @name        Password Module
 * @description	Controls the access to password-protected albums and photos.
 * @author      Tobias Reich
 * @copyright   2014 by Tobias Reich
 * @translated into german by Alessio Bisgen
 */

password = {

	value: "",

	set: function(albumID) {

		var buttons,
			params;

		buttons = [
			["Passwort setzen", function() {

				if (visible.album()) {
					album.json.password = true;
					view.album.password();
				}

				params = "setAlbumPassword&albumID=" + albumID + "&password=" + hex_md5($(".message input.text").val());
				lychee.api(params, function(data) {

					if (data!==true) lychee.error(null, params, data);

				});

			}],
			["Abbrechen", function() {}]
		];
		modal.show("Passwortsetzen", "Setze ein Passwort um '" + album.json.title + "' vor Unbefugten zu schützen. Nur Personen mit diesem Passwort können das Album sehen. <input class='text' type='password' placeholder='Passwort' value=''>", buttons);

	},

	get: function(albumID, callback) {

		var passwd = $(".message input.text").val(),
			params;

		if (!lychee.publicMode) callback();
		else if (album.json&&album.json.password==false) callback();
		else if (albums.json&&albums.json.content[albumID].password==false) callback();
		else if (!albums.json&&!album.json) {

			// Continue without password
			album.json = {password: true};
			callback("");

		} else if (passwd==undefined) {

			// Request password
			password.getDialog(albumID, callback);

		} else {

			// Check password
			params = "checkAlbumAccess&albumID=" + albumID + "&password=" + hex_md5(passwd);
			lychee.api(params, function(data) {

				if (data===true) {
					password.value = hex_md5(passwd);
					callback();
				} else {
					lychee.goto("");
					loadingBar.show("error", "Zugriff verweigert. Falsches Passwort!");
				}

			});

		}

	},

	getDialog: function(albumID, callback) {

		var buttons;

		buttons = [
			["Enter", function() { password.get(albumID, callback) }],
			["Abbrechen", lychee.goto]
		];
		modal.show("<a class='icon-lock'></a> Bitte Passwort eingeben", "Dieses Album ist passwortgeschützt. Gib das Passwort unten ein um die Fotos zu sehen: <input class='text' type='password' placeholder='Passwort' value=''>", buttons, -110, false);

	},

	remove: function(albumID) {

		var params;

		if (visible.album()) {
			album.json.password = false;
			view.album.password();
		}

		params = "setAlbumPassword&albumID=" + albumID + "&password=";
		lychee.api(params, function(data) {

			if (data!==true) lychee.error(null, params, data);

		});

	}

};
