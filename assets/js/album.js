/**
 * @name		Album Module
 * @description	Takes care of every action an album can handle and execute.
 * @author		Tobias Reich
 * @translated into german by Alessio Bisgen
 * @copyright	2014 by Tobias Reich
 */

album = {

	json: null,

	getID: function() {

		var id;

		if (photo.json) id = photo.json.album;
		else if (album.json) id = album.json.id;
		else id = $(".album:hover, .album.active").attr("data-id");

		// Search
		if (!id) id = $(".photo:hover, .photo.active").attr("data-album-id");

		if (id) return id;
		else return false;

	},

	load: function(albumID, refresh) {

		var startTime,
			params,
			durationTime,
			waitTime;

		password.get(albumID, function() {

			if (!refresh) {
				loadingBar.show();
				lychee.animate(".album, .photo", "contentZoomOut");
				lychee.animate(".divider", "fadeOut");
			}

			startTime = new Date().getTime();

			params = "getAlbum&albumID=" + albumID + "&password=" + password.value;
			lychee.api(params, function(data) {

				if (data==="Warning: Album private!") {
					if (document.location.hash.replace("#", "").split("/")[1]!=undefined) {
						// Display photo only
						lychee.setMode("view");
					} else {
						// Album not public
						lychee.content.show();
						lychee.goto("");
					}
					return false;
				}

				if (data==="Warning: Wrong password!") {
					album.load(albumID, refresh);
					return false;
				}

				album.json = data;

				durationTime = (new Date().getTime() - startTime);
				if (durationTime>300) waitTime = 0; else if (refresh) waitTime = 0; else waitTime = 300 - durationTime;
				if (!visible.albums()&&!visible.photo()&&!visible.album()) waitTime = 0;

				setTimeout(function() {

					view.album.init();

					if (!refresh) {
						lychee.animate(".album, .photo", "contentZoomIn");
						view.header.mode("album");
					}

				}, waitTime);

			});

		});

	},

	parse: function(photo) {

		if (photo&&photo.thumbUrl) photo.thumbUrl = lychee.upload_path_thumb + photo.thumbUrl;
		else if (!album.json.title) album.json.title = "Untitled";

	},

	add: function() {

		var title,
			params,
			buttons;

		buttons = [
			["Album erstellen", function() {

				title = $(".message input.text").val();

				if (title.length===0) title = "Unbenannt";

				modal.close();

				params = "addAlbum&title=" + escape(encodeURI(title));
				lychee.api(params, function(data) {

					if (data!==false) {
						if (data===true) data = 1; // Avoid first album to be true
						lychee.goto(data);
					} else lychee.error(null, params, data);

				});

			}],
			["Abbrechen", function() {}]
		];

		modal.show("Neues Album", "Gib den Namen für dieses Album ein: <input class='text' type='text' maxlength='30' placeholder='Titel' value='Unbenannt'>", buttons);

	},

	delete: function(albumIDs) {

		var params,
			buttons,
			albumTitle;

		if (!albumIDs) return false;
		if (albumIDs instanceof Array===false) albumIDs = [albumIDs];

		buttons = [
			["", function() {

				params = "deleteAlbum&albumIDs=" + albumIDs;
				lychee.api(params, function(data) {

					if (visible.albums()) {

						albumIDs.forEach(function(id, index, array) {
							albums.json.num--;
							view.albums.content.delete(id);
						});

					} else lychee.goto("");

					if (data!==true) lychee.error(null, params, data);

				});

			}],
			["", function() {}]
		];

		if (albumIDs.toString()==="0") {

			buttons[0][0] = "Unsortierte löschen";
			buttons[1][0] = "Unsortierte behalten";

			modal.show("Unsortierte löschen", "Bist du sicher, dass du alle unsortierten Bilder löschen möchtest?<br>Dies kann nicht rückgängig gemacht werden!", buttons);

		} else if (albumIDs.length===1) {

			buttons[0][0] = "Album und dessen Fotos löschen";
			buttons[1][0] = "Album behalten";

			// Get title
			if (album.json) albumTitle = album.json.title;
			else if (albums.json) albumTitle = albums.json.content[albumIDs].title;

			modal.show("Album löschen", "Bist du sicher, dass du das Album '" + albumTitle + "' und all seine enthaltenen Bilder löschen möchtest? Dies kann nicht rückgängig gemacht werden!", buttons);

		} else {

			buttons[0][0] = "Alben und deren Fotos löschen";
			buttons[1][0] = "Alben behalten";

			modal.show("Alben löschen", "Bist du sicher, dass du alle " + albumIDs.length + " ausgewählten Alben mitsamt ihrer Bilder löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden!", buttons);

		}

	},

	setTitle: function(albumIDs) {

		var oldTitle = "",
			newTitle,
			params,
			buttons;

		if (!albumIDs) return false;
		if (albumIDs instanceof Array===false) albumIDs = [albumIDs];

		if (albumIDs.length===1) {
			// Get old title if only one album is selected
			if (album.json) oldTitle = album.json.title;
			else if (albums.json) oldTitle = albums.json.content[albumIDs].title;
			oldTitle = oldTitle.replace("'", "&apos;");
		}

		buttons = [
			["Titel setzen", function() {

				newTitle = ($(".message input.text").val()==="") ? "Unbenannt" : $(".message input.text").val();

				if (visible.album()) {

					album.json.title = newTitle;
					view.album.title();

				} else if (visible.albums()) {

					albumIDs.forEach(function(id, index, array) {
						albums.json.content[id].title = newTitle;
						view.albums.content.title(id);
					});

				}

				params = "setAlbumTitle&albumIDs=" + albumIDs + "&title=" + escape(encodeURI(newTitle));
				lychee.api(params, function(data) {

					if (data!==true) lychee.error(null, params, data);

				});

			}],
			["Abbrechen", function() {}]
		];

		if (albumIDs.length===1) modal.show("Titel setzen", "Gib einen neuen Titel für dieses Album ein: <input class='text' type='text' maxlength='30' placeholder='Titel' value='" + oldTitle + "'>", buttons);
		else modal.show("Titel setzen", "Gib einen Titel für alle " + albumIDs.length + " ausgewählten Alben eine: <input class='text' type='text' maxlength='30' placeholder='Titel' value='" + oldTitle + "'>", buttons);

	},

	setDescription: function(photoID) {

		var oldDescription = album.json.description.replace("'", "&apos;"),
			description,
			params,
			buttons;

		buttons = [
			["Setze Beschreibung", function() {

				description = $(".message input.text").val();

				if (visible.album()) {
					album.json.description = description;
					view.album.description();
				}

				params = "setAlbumDescription&albumID=" + photoID + "&description=" + escape(description);
				lychee.api(params, function(data) {

					if (data!==true) lychee.error(null, params, data);

				});

			}],
			["Abbrechen", function() {}]
		];

		modal.show("Setze Beschreibung", "Gub bitte eine Beschreibung für dieses Album ein: <input class='text' type='text' maxlength='800' placeholder='Beschreibung' value='" + oldDescription + "'>", buttons);

	},

	setPublic: function(albumID, e) {

		var params;

		if ($(".message input.text").length>0&&$(".message input.text").val().length>0) {

			params = "setAlbumPublic&albumID=" + albumID + "&password=" + hex_md5($(".message input.text").val());
			album.json.password = true;

		} else {

			params = "setAlbumPublic&albumID=" + albumID;
			album.json.password = false;

		}

		if (visible.album()) {

			album.json.public = (album.json.public==0) ? 1 : 0;
			view.album.public();
			view.album.password();
			if (album.json.public==1) contextMenu.shareAlbum(albumID, e);

		}

		lychee.api(params, function(data) {

			if (data!==true) lychee.error(null, params, data);

		});

	},

	share: function(service) {

		var link = "",
			url = location.href;

		switch (service) {
			case 0:
				link = "https://twitter.com/share?url=" + encodeURI(url);
				break;
			case 1:
				link = "http://www.facebook.com/sharer.php?u=" + encodeURI(url) + "&t=" + encodeURI(album.json.title);
				break;
			case 2:
				link = "mailto:?subject=" + encodeURI(album.json.title) + "&body=" + encodeURI("Hi! Schau dir das mal an: " + url);
				break;
			default:
				link = "";
				break;
		}

		if (link.length>5) location.href = link;

	},

	getArchive: function(albumID) {

		var link;

		if (location.href.indexOf("index.html")>0) link = location.href.replace(location.hash, "").replace("index.html", "php/api.php?function=getAlbumArchive&albumID=" + albumID);
		else link = location.href.replace(location.hash, "") + "php/api.php?function=getAlbumArchive&albumID=" + albumID;

		if (lychee.publicMode) link += "&password=" + password.value;

		location.href = link;

	}

};
