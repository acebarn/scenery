/**
 * @name		Settings Module
 * @description	Lets you change settings.
 * @author		Tobias Reich
 * @copyright	2014 by Tobias Reich
 * @translated into german by Alessio Bisgen
 */

var settings = {

	createConfig: function() {

		var dbName,
			dbUser,
			dbPassword,
			dbHost,
			buttons;

		buttons = [
			["Connect", function() {

				dbHost = $(".message input.text#dbHost").val();
				dbUser = $(".message input.text#dbUser").val();
				dbPassword = $(".message input.text#dbPassword").val();
				dbName = $(".message input.text#dbName").val();

				if (dbHost.length<1) dbHost = "localhost";
				if (dbName.length<1) dbName = "lychee";

				params = "dbCreateConfig&dbName=" + escape(dbName) + "&dbUser=" + escape(dbUser) + "&dbPassword=" + escape(dbPassword) + "&dbHost=" + escape(dbHost) + "&version=" + escape(lychee.version);
				lychee.api(params, function(data) {

					if (data!==true) {

						// Configuration failed
						setTimeout(function() {

							// Connection failed
							if (data.indexOf("Achtung: Verbindungsfehler!")!==-1) {

								buttons = [
									["Nochmal versuchen", function() { setTimeout(settings.createConfig, 400) }],
									["", function() {}]
								];
								modal.show("Verbindungsfehler", "Verbindung zur Datenbank konnte nicht hergestellt werden. Überprüfe den host, den Nutzernamen und das Passwort und stelle sicher, dass der Zugriff von deiner aktuellen Position aus erlaubt ist.", buttons, null, false);
								return false;

							}

							// Could not create file
							if (data.indexOf("Achtung: Konnte Datei nicht erstellen!")!==-1) {

								buttons = [
									["Nochmal versuchen", function() { setTimeout(settings.createConfig, 400) }],
									["", function() {}]
								];
								modal.show("Speichern fehlgeschlagen", "Die Konfiguration konnte nicht gespeichert werden. Zugriff in <b>'data/'</b> verweigert. Bitte setze die Lese-, Schreib- und Ausführungsrechte für andere in <b>'data/'</b> und <b>'uploads/'</b>. Wirf einen Blick ins readme für weitere Infos.", buttons, null, false);
								return false;

							}

							// Something went wrong
							buttons = [
								["Nochmal versuchen", function() { setTimeout(settings.createConfig, 400) }],
								["", function() {}]
							];
							modal.show("Konfiguration fehlgeschlagen", "Etwas unerwartetes ist passiert. Bitte versuche es nochmal und überprüfe Server und Installation. Wirf einen Blick ins readme für weitere Infos.", buttons, null, false);
							return false;

						}, 400);

					} else {

						// Configuration successful
						window.location.reload();

					}

				});

			}],
			["", function() {}]
		];

		modal.show("Konfiguration", "Gib deine Datenbanks-Verbindungseinstellungen ein: <input id='dbHost' class='text less' type='text' placeholder='Host (optional)' value=''><input id='dbUser' class='text less' type='text' placeholder='Nutzername' value=''><input id='dbPassword' class='text more' type='password' placeholder='Passwort' value=''><br>Lychee wird seine eigene Datenbank erstellen. Falls notwendig, kannst du stattdessen einen eigenen Namen eingeben:<input id='dbName' class='text more' type='text' placeholder='Datenbank (optional)' value=''>", buttons, -215, false);

	},

	createLogin: function() {

		var username,
			password,
			params,
			buttons;

		buttons = [
			["Login erstellen", function() {

				username = $(".message input.text#username").val();
				password = $(".message input.text#password").val();

				if (username.length<1||password.length<1) {

					setTimeout(function() {

						buttons = [
							["Nochmal versuchen", function() { setTimeout(settings.createLogin, 400) }],
							["", function() {}]
						];
						modal.show("Falsche Eingabe", "Der Nutzername oder das Passwort sind nicht lang genug. Bitte versuche es nochmal!", buttons, null, false);
						return false;

					}, 400);

				} else {

					params = "setLogin&username=" + escape(username) + "&password=" + hex_md5(password);
					lychee.api(params, function(data) {

						if (data!==true) {

							setTimeout(function() {

								buttons = [
									["Nochmal versuchen", function() { setTimeout(settings.createLogin, 400) }],
									["", function() {}]
								];
								modal.show("Erstellung fehlgeschlagen, "Unable to save login. Please try again with another username and password!", buttons, null, false);
								return false;

							}, 400);

						}

					});

				}

			}],
			["", function() {}]
		];

		modal.show("Login erstellen", "Gib einen Nutzernamen und ein Passwort für deine Installation ein: <input id='username' class='text less' type='text' placeholder='Neuer Nutzername' value=''><input id='password' class='text' type='password' placeholder='Neues Passwort' value=''>", buttons, -122, false);

	},

	setLogin: function() {

		var old_password,
			username,
			password,
			params,
			buttons;

		buttons = [
			["Logindaten ändern", function() {

				old_password = $(".message input.text#old_password").val();
				username = $(".message input.text#username").val();
				password = $(".message input.text#password").val();

				if (old_password.length<1) {
					loadingBar.show("Fehler", "Dein altes Passwort ist falsch. Bitte versuche es nochmal!");
					return false;
				}

				if (username.length<1) {
					loadingBar.show("Fehler", "Dein alter Nutzername ist falsch. Bitte versuche es nochmal!");
					return false;
				}

				if (password.length<1) {
					loadingBar.show("Fehler", "Dein neues Passwort ist falsch. Bitte versuche es nochmal!);
					return false;
				}

				params = "setLogin&oldPassword=" + hex_md5(old_password) + "&username=" + escape(username) + "&password=" + hex_md5(password);
				lychee.api(params, function(data) {

					if (data!==true) lychee.error(null, params, data);

				});

			}],
			["Abbrechen", function() {}]
		];

		modal.show("Logindaten ändern", "Gib dein aktuelles Passwort ein: <input id='old_password' class='text more' type='password' placeholder='Aktuelles Passwort' value=''><br>Dein Nutzername und dein Passwort werden in folgendes geändert: <input id='username' class='text less' type='text' placeholder='Neuer Nutzername' value=''><input id='password' class='text' type='password' placeholder='Neues Passwort' value=''>", buttons, -171);

	},

	setSorting: function() {

		var buttons,
			sorting;

		buttons = [
			["Sortierung ändern", function() {

				sorting[0] = $("select#settings_type").val();
				sorting[1] = $("select#settings_order").val();

				params = "setSorting&type=" + sorting[0] + "&order=" + sorting[1];
				lychee.api(params, function(data) {

					if (data===true) {
						lychee.sorting = "ORDER BY " + sorting[0] + " " + sorting[1];
						lychee.load();
					} else lychee.error(null, params, data);

				});

			}],
			["Abbrechen", function() {}]
		];
		modal.show("Sortierung ändern",
			"Fotos sortieren nach \
				<select id='settings_type'> \
					<option value='id'>Uploadzeitpunkt</option> \
					<option value='take'>Aufnahmedatum/option> \
					<option value='title'>Titel</option> \
					<option value='description'>Beschreibung</option> \
					<option value='public'>Öffentlichkeit</option> \
					<option value='star'>Sterne</option> \
					<option value='type'>Format</option> \
				</select> \
				in an \
				<select id='settings_order'> \
					<option value='ASC'>Aufsteigend</option> \
					<option value='DESC'>Absteigend</option> \
				</select> \
				order.\
			", buttons);

		if (lychee.sorting!=="") {
			sorting = lychee.sorting.replace("ORDER BY ", "").split(" ");

			// Special parsing
			if (sorting[0]==='UNIX_TIMESTAMP(STR_TO_DATE(CONCAT(takedate,"-",taketime),"%d.%m.%Y-%H:%i:%S"))') sorting[0] = "take";

			$("select#settings_type").val(sorting[0]);
			$("select#settings_order").val(sorting[1]);
		}

	},

	setDropboxKey: function(callback) {

		var buttons,
			params,
			key;

		buttons = [
			["Key setzen", function() {

				key = $(".message input.text#key").val();

				params = "setDropboxKey&key=" + key;
				lychee.api(params, function(data) {

					if (data===true) {
						lychee.dropboxKey = key;
						if (callback) lychee.loadDropbox(callback);
					} else lychee.error(null, params, data);

				});

			}],
			["Abbrechen", function() {}]
		];

		modal.show("Dropbox-Key setzen", "Um Fotos von deiner Dropbox zu importieren, benötigst du einen gültigen drop-ins app key von <a href='https://www.dropbox.com/developers/apps/create'>Der offiziellen Webseite</a>. Generier dir einen persönlichen Key und gib ihn hier ein: <input id='key' class='text' type='text' placeholder='Dropbox API Key' value='" + lychee.dropboxKey + "'>", buttons);

	}

};
