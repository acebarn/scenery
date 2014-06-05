/**
 * @name		Photo Module
 * @description	Takes care of every action a photo can handle and execute.
 * @author		Tobias Reich
 * @copyright	2014 by Tobias Reich
 * @translated into german by Alessio Bisgen
 */

photo = {

	json: null,

	getID: function() {

		var id;

		if (photo.json) id = photo.json.id;
		else id = $(".photo:hover, .photo.active").attr("data-id");

		if (id) return id;
		else return false;

	},

	load: function(photoID, albumID) {

		var params,
			checkPasswd;

		params = "getPhoto&photoID=" + photoID + "&albumID=" + albumID + "&password=" + password.value;
		lychee.api(params, function(data) {

			if (data==="Achtung: Falsches Passwort!") {
				checkPasswd = function() {
					if (password.value!=="") photo.load(photoID, albumID);
					else setTimeout(checkPasswd, 250);
				};
				checkPasswd();
				return false;
			}

			photo.json = data;
			if (!visible.photo()) view.photo.show();
			view.photo.init();

			lychee.imageview.show();
			setTimeout(function() { lychee.content.show() }, 300);

		});

	},

	parse: function() {

		if (!photo.json.title) photo.json.title = "Unbenannt";
		photo.json.url = lychee.upload_path_big + photo.json.url;

	},

	delete: function(photoIDs) {

		var params,
			buttons,
			photoTitle;

		if (!photoIDs) return false;
		if (photoIDs instanceof Array===false) photoIDs = [photoIDs];

		if (photoIDs.length===1) {
			// Get title if only one photo is selected
			if (visible.photo()) photoTitle = photo.json.title;
			else photoTitle = album.json.content[photoIDs].title;
			if (photoTitle==="") photoTitle = "Unbenannt";
		}

		buttons = [
			["", function() {

				photoIDs.forEach(function(id, index, array) {

					// Change reference for the next and previous photo
					if (album.json.content[id].nextPhoto!==""||album.json.content[id].previousPhoto!=="") {

						nextPhoto = album.json.content[id].nextPhoto;
						previousPhoto = album.json.content[id].previousPhoto;

						album.json.content[previousPhoto].nextPhoto = nextPhoto;
						album.json.content[nextPhoto].previousPhoto = previousPhoto;

					}

					album.json.content[id] = null;
					view.album.content.delete(id);

				});

				// Only when search is not active
				if (!visible.albums()) lychee.goto(album.getID());

				params = "deletePhoto&photoIDs=" + photoIDs;
				lychee.api(params, function(data) {

					if (data!==true) lychee.error(null, params, data);

				});

			}],
			["", function() {}]
		];

		if (photoIDs.length===1) {

			buttons[0][0] = "Foto löschen";
			buttons[1][0] = "Foto behalten";

			modal.show("Foto löschen", "Bist du sicher, dass du das Foto löschen möchtest '" + photoTitle + "'?<br>Dies kann nicht rückgängig gemacht werden!", buttons);

		} else {

			buttons[0][0] = "Fotos löschen";
			buttons[1][0] = "Fotos behalten";

			modal.show("Fotos löschen", "Bist du sicher, dass du alle " + photoIDs.length + " gewählten Fotos löschen möchtest?<br>Dies kann nicht rückgängig gemacht werden!", buttons);

		}

	},

	setTitle: function(photoIDs) {

		var oldTitle = "",
			newTitle,
			params,
			buttons;

		if (!photoIDs) return false;
		if (photoIDs instanceof Array===false) photoIDs = [photoIDs];

		if (photoIDs.length===1) {
			// Get old title if only one photo is selected
			if (photo.json) oldTitle = photo.json.title;
			else if (album.json) oldTitle = album.json.content[photoIDs].title;
			oldTitle = oldTitle.replace("'", "&apos;");
		}

		buttons = [
			["Titel setzen", function() {

				newTitle = $(".message input.text").val();

				if (visible.photo()) {
					photo.json.title = (newTitle==="") ? "Unbenannt" : newTitle;
					view.photo.title();
				}

				photoIDs.forEach(function(id, index, array) {
					album.json.content[id].title = newTitle;
					view.album.content.title(id);
				});

				params = "setPhotoTitle&photoIDs=" + photoIDs + "&title=" + escape(encodeURI(newTitle));
				lychee.api(params, function(data) {

					if (data!==true) lychee.error(null, params, data);

				});

			}],
			["Abbrechen", function() {}]
		];

		if (photoIDs.length===1) modal.show("Titel setzen", "Gib einen neuen Titel für dieses Foto ein: <input class='text' type='text' maxlength='30' placeholder='Titel' value='" + oldTitle + "'>", buttons);
		else modal.show("Titel setzen", "Gib einen Titel für alle " + photoIDs.length + " ausgewählten Fotos ein: <input class='text' type='text' maxlength='30' placeholder='Titel' value=''>", buttons);

	},

	setAlbum: function(photoIDs, albumID) {

		var params,
			nextPhoto,
			previousPhoto;

		if (!photoIDs) return false;
		if (visible.photo) lychee.goto(album.getID());
		if (photoIDs instanceof Array===false) photoIDs = [photoIDs];

		photoIDs.forEach(function(id, index, array) {

			// Change reference for the next and previous photo
			if (album.json.content[id].nextPhoto!==""||album.json.content[id].previousPhoto!=="") {

				nextPhoto = album.json.content[id].nextPhoto;
				previousPhoto = album.json.content[id].previousPhoto;

				album.json.content[previousPhoto].nextPhoto = nextPhoto;
				album.json.content[nextPhoto].previousPhoto = previousPhoto;

			}

			album.json.content[id] = null;
			view.album.content.delete(id);

		});

		params = "setPhotoAlbum&photoIDs=" + photoIDs + "&albumID=" + albumID;
		lychee.api(params, function(data) {

			if (data!==true) lychee.error(null, params, data);

		});

	},

	setStar: function(photoIDs) {

		var params;

		if (!photoIDs) return false;
		if (visible.photo()) {
			photo.json.star = (photo.json.star==0) ? 1 : 0;
			view.photo.star();
		}

		photoIDs.forEach(function(id, index, array) {
			album.json.content[id].star = (album.json.content[id].star==0) ? 1 : 0;
			view.album.content.star(id);
		});

		params = "setPhotoStar&photoIDs=" + photoIDs;
		lychee.api(params, function(data) {

			if (data!==true) lychee.error(null, params, data);

		});

	},

	setPublic: function(photoID, e) {

		var params;

		if (photo.json.public==2) {

			modal.show("Öffentliches Album", "Diese Foto befindet sich in einem öffentlichen Album. Um dieses Foto öffentlich oder privat zu setzen musst du die Eigenschaften des zugehörigen Albums ändern.", [["Album anzeigen", function() { lychee.goto(photo.json.original_album) }], ["Schließen", function() {}]]);
			return false;

		}

		if (visible.photo()) {

			photo.json.public = (photo.json.public==0) ? 1 : 0;
			view.photo.public();
			if (photo.json.public==1) contextMenu.sharePhoto(photoID, e);

		}

		album.json.content[photoID].public = (album.json.content[photoID].public==0) ? 1 : 0;
		view.album.content.public(photoID);

		params = "setPhotoPublic&photoID=" + photoID + "&url=" + photo.getViewLink(photoID);
		lychee.api(params, function(data) {

			if (data!==true) lychee.error(null, params, data);

		});

	},

	setDescription: function(photoID) {

		var oldDescription = photo.json.description.replace("'", "&apos;"),
			description,
			params,
			buttons;

		buttons = [
			["Beschreibung setzen", function() {

				description = $(".message input.text").val();

				if (visible.photo()) {
					photo.json.description = description;
					view.photo.description();
				}

				params = "setPhotoDescription&photoID=" + photoID + "&description=" + escape(description);
				lychee.api(params, function(data) {

					if (data!==true) lychee.error(null, params, data);

				});

			}],
			["Abbrechen", function() {}]
		];

		modal.show("Beschreibung setzen", "Gib eine Beschreibung für dieses Foto ein: <input class='text' type='text' maxlength='800' placeholder='Beschreibung' value='" + oldDescription + "'>", buttons);

	},

	editTags: function(photoIDs) {

		var oldTags = "",
			tags = "";

		if (!photoIDs) return false;
		if (photoIDs instanceof Array===false) photoIDs = [photoIDs];

		// Get tags
		if (visible.photo()) oldTags = photo.json.tags;
		if (visible.album()&&photoIDs.length===1) oldTags = album.json.content[photoIDs].tags;
		if (visible.album()&&photoIDs.length>1) {
			var same = true;
			photoIDs.forEach(function(id, index, array) {
				if(album.json.content[id].tags===album.json.content[photoIDs[0]].tags&&same===true) same = true;
				else same = false;
			});
			if (same) oldTags = album.json.content[photoIDs[0]].tags;
		}

		// Improve tags
		oldTags = oldTags.replace(/,/g, ', ');

		buttons = [
			["Tags setzen", function() {

				tags = $(".message input.text").val();

				photo.setTags(photoIDs, tags);

			}],
			["Abbrechen", function() {}]
		];

		if (photoIDs.length===1) modal.show("Tags setzen", "Gib deine Tags für dieses Foto ein. Du kannst mehrere Tags eingeben, indem du sie mit Kommata trennst: <input class='text' type='text' maxlength='800' placeholder='Tags' value='" + oldTags + "'>", buttons);
		else modal.show("Tags setzen", "Gib deine Tags für alle " + photoIDs.length + " ausgewählten Fotos ein. Bestehende Tags werden überschrieben. Du kannst mehrere Tags einfügen, indem du sie mit Kommta trennst: <input class='text' type='text' maxlength='800' placeholder='Tags' value='" + oldTags + "'>", buttons);

	},

	setTags: function(photoIDs, tags) {

		var params;

		if (!photoIDs) return false;
		if (photoIDs instanceof Array===false) photoIDs = [photoIDs];

		// Parse tags
		tags = tags.replace(/(\ ,\ )|(\ ,)|(,\ )|(,{1,}\ {0,})|(,$|^,)/g, ',');
		tags = tags.replace(/,$|^,/g, '');

		if (visible.photo()) {
			photo.json.tags = tags;
			view.photo.tags();
		}

		photoIDs.forEach(function(id, index, array) {
			album.json.content[id].tags = tags;
		});

		params = "setPhotoTags&photoIDs=" + photoIDs + "&tags=" + tags;
		lychee.api(params, function(data) {

			if (data!==true) lychee.error(null, params, data);

		});

	},

	deleteTag: function(photoID, index) {

		var tags;

		// Remove
		tags = photo.json.tags.split(',');
		tags.splice(index, 1);

		// Save
		photo.json.tags = tags.toString();
		photo.setTags([photoID], photo.json.tags);

	},

	share: function(photoID, service) {

		var link = "",
			url = photo.getViewLink(photoID),
			filename = "unknown";

		switch (service) {
			case 0:
				link = "https://twitter.com/share?url=" + encodeURI(url);
				break;
			case 1:
				link = "http://www.facebook.com/sharer.php?u=" + encodeURI(url) + "&t=" + encodeURI(photo.json.title);
				break;
			case 2:
				link = "mailto:?subject=" + encodeURI(photo.json.title) + "&body=" + encodeURI(url);
				break;
			case 3:
				lychee.loadDropbox(function() {
					filename = photo.json.title + "." + photo.getDirectLink().split('.').pop();
					Dropbox.save(photo.getDirectLink(), filename);
				});
				break;
			default:
				link = "";
				break;
		}

		if (link.length>5) location.href = link;

	},

	isSmall: function() {

		var size = {
			width: false,
			height: false
		};

		if (photo.json.width<$(window).width()-60) size.width = true;
		if (photo.json.height<$(window).height()-100) size.height = true;

		if (size.width&&size.height) return true;
		else return false;

	},

	getArchive: function(photoID) {

		var link;

		if (location.href.indexOf("index.html")>0) link = location.href.replace(location.hash, "").replace("index.html", "php/api.php?function=getPhotoArchive&photoID=" + photoID);
		else link = location.href.replace(location.hash, "") + "php/api.php?function=getPhotoArchive&photoID=" + photoID;

		if (lychee.publicMode) link += "&password=" + password.value;

		location.href = link;

	},

	getDirectLink: function() {

		return $("#imageview #image").css("background-image").replace(/"/g,"").replace(/url\(|\)$/ig, "");

	},

	getViewLink: function(photoID) {

		if (location.href.indexOf("index.html")>0) return location.href.replace("index.html" + location.hash, "view.php?p=" + photoID);
		else return location.href.replace(location.hash, "view.php?p=" + photoID);

	}

};
