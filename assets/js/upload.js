/**
 * @name		Album Module
 * @description	Takes care of every action an album can handle and execute.
 * @author		Tobias Reich
 * @copyright	2014 by Tobias Reich
 * @translated into german by Alessio Bisgen
 */

upload = {

	show: function(icon, text) {

		if (icon===undefined) icon = "upload";

		upload.close(true);
		$("body").append(build.uploadModal(icon, text));

	},

	setIcon: function(icon) {

		$(".upload_message a").remove();
		$(".upload_message").prepend("<a class='icon-" + icon + "'></a>");

	},

	setProgress: function(progress) {

		$(".progressbar div").css("width", progress + "%");

	},

	setText: function(text) {

		$(".progressbar").remove();
		$(".upload_message").append("<p>" + text + "</p>");

	},

	notify: function(title) {

		var popup;

		if (!window.webkitNotifications) return false;

		if (window.webkitNotifications.checkPermission()!==0) window.webkitNotifications.requestPermission();

		if (window.webkitNotifications.checkPermission()===0&&title) {
			popup = window.webkitNotifications.createNotification("", title, "Du kannst jetzt deinen neuen Fotos verwalten.");
			popup.show();
		}

	},

	start: {

		local: function(files) {

			var pre_progress = 0,
				formData = new FormData(),
				xhr = new XMLHttpRequest(),
				albumID = album.getID(),
				popup,
				progress;

			if (files.length<=0) return false;
			if (albumID===false) albumID = 0;

			formData.append("function", "upload");
			formData.append("albumID", albumID);

			for (var i = 0; i < files.length; i++) {

				if (files[i].type!=="image/jpeg"&&files[i].type!=="image/jpg"&&files[i].type!=="image/png"&&files[i].type!=="image/gif"&&files[i].type!=="image/webp") {
					loadingBar.show("Fehler", "Das Dateiformat " + files[i].name + " wird nicht unterstützt.");
					return false;
				} else {
					formData.append(i, files[i]);
				}

			}

			upload.show();

			window.onbeforeunload = function() { return "Lychee lädt hoch!"; };

			xhr.open("POST", lychee.api_path);

			xhr.onload = function() {

				if (xhr.status===200) {

					upload.close();
					upload.notify("Hochladen abgeschlossen");

					window.onbeforeunload = null;

					if (album.getID()===false) lychee.goto("0");
					else album.load(albumID);

				}

			};

			xhr.upload.onprogress = function(e) {

				if (e.lengthComputable) {

					progress = (e.loaded / e.total * 100 | 0);

					if (progress>pre_progress) {
						upload.setProgress(progress);
						pre_progress = progress;
					}

					if (progress>=100) {
						upload.setIcon("cog");
						upload.setText("Fotos werden verarbeitet");
					}

				}

			};

			$("#upload_files").val("");

			xhr.send(formData);

		},

		url: function() {

			var albumID = album.getID(),
				params,
				extension,
				buttons;

			if (albumID===false) albumID = 0;

			buttons = [
				["Importieren", function() {

					link = $(".message input.text").val();

					if (link&&link.length>3) {

						extension = link.split('.').pop();
						if (extension!=="jpeg"&&extension!=="jpg"&&extension!=="png"&&extension!=="gif"&&extension!=="webp") {
							loadingBar.show("Fehler", "Das Dateiformat dieses Links wird nicht unterstützt.");
							return false;
						}

						modal.close();
						upload.show("cog", "Von URL importieren");

						params = "importUrl&url=" + escape(encodeURI(link)) + "&albumID=" + albumID;
						lychee.api(params, function(data) {

							upload.close();
							upload.notify("Import abgeschlossen");

							if (album.getID()===false) lychee.goto("0");
							else album.load(albumID);

							if (data!==true) lychee.error(null, params, data);

						});

					} else loadingBar.show("Fehler", "Link ist zu kurz oder zu lang. Bitte versuche einen anderen zu benutzen!");

				}],
				["Abbrechen", function() {}]
			];

			modal.show("Von Link importieren", "Bitte gib den Direktlink zu einem Foto an, um es zu importieren: <input class='text' type='text' placeholder='http://' value='http://'>", buttons);

		},

		server: function() {

			var albumID = album.getID(),
				params,
				buttons;

			if (albumID===false) albumID = 0;

			buttons = [
				["Import", function() {

					modal.close();
					upload.show("cog", "Fotos werden importiert");

					params = "importServer&albumID=" + albumID;
					lychee.api(params, function(data) {

						upload.close();
						upload.notify("Import abgeschlossen");

						if (data==="Notice: Import only contains albums!") {
							if (visible.albums()) lychee.load();
							else lychee.goto("");
						}
						else if (album.getID()===false) lychee.goto("0");
						else album.load(albumID);

						if (data==="Notice: Import only contains albums!") return true;
						else if (data==="Warning: Folder empty!") lychee.error("Ordner ist leer. Keine Fotos wurden importiert!", params, data);
						else if (data!==true) lychee.error(null, params, data);

					});

				}],
				["Abbrechen", function() {}]
			];

			modal.show("Import von Server", "Diese Aktion wird alle Fotos importieren, welche in <b>'uploads/import/'</b> liegen.", buttons);

		},

		dropbox: function() {

			var albumID = album.getID(),
				params;

			if (albumID===false) albumID = 0;

			lychee.loadDropbox(function() {
				Dropbox.choose({
					linkType: "direct",
					multiselect: true,
					success: function(files) {

						if (files.length>1) {

							for (var i = 0; i < files.length; i++) files[i] = files[i].link;

						} else files = files[0].link;

						upload.show("cog", "Fotos werden importiert");

						params = "importUrl&url=" + escape(files) + "&albumID=" + albumID;
						lychee.api(params, function(data) {

							upload.close();
							upload.notify("Import abgeschlossen");

							if (album.getID()===false) lychee.goto("0");
							else album.load(albumID);

							if (data!==true) lychee.error(null, params, data);

						});

					}
				});
			});

		}

	},

	close: function(force) {

		if (force===true) {
			$(".upload_overlay").remove();
		} else {
			upload.setProgress(100);
			$(".upload_overlay").removeClass("fadeIn").css("opacity", 0);
			setTimeout(function() { $(".upload_overlay").remove() }, 300);
		}

	}

};
