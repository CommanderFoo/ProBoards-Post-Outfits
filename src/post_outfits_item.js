class Post_Outfits_Item {

	create(item = {}, key = "", can_remove = false){
		let html = "";

		html += "<div class='post-outfits-item' data-post-outfits-id='" + parseInt(key, 10) + "'>";

		html += "<div class='post-outfits-item-preview'>";
		html += "<div class='post-outfits-item-asterisk'><img src='" + Post_Outfits.IMAGES.asterisk + "' /></div>";

		let img_url = "";

		if(item.i.length > 10){
			img_url = item.i;
			html += "<img class='post-outfits-item-preview-img' src='" + yootil.html_encode(item.i) + "' />";
		} else {
			html += "<img class='post-outfits-item-preview-img' src='" + Post_Outfits.IMAGES.nopreview + "' />";
		}

		html += "<div class='post-outfits-item-image-url'><input placeholder='Preview Image URL...' type='text' value='" + pb.text.escape_html(img_url) + "' /></div>";

		html += "</div>";

		html += "<div class='post-outfits-item-content'>";
		html += "<textarea cols='1' rows='1'>" + item.t + "</textarea>";
		html += "</div>";

		let opacity = (can_remove)? 1 : 0.4;

		html += "<div class='post-outfits-item-controls'>";
		html += "<div><img class='post-outfits-item-picture' src='" + Post_Outfits.IMAGES.picture + "' title='Edit Picture' /></div>";
		html += "<div><img class='post-outfits-item-save' src='" + Post_Outfits.IMAGES.save + "' title='Save Template' /></div>";
		html += "<div><img class='post-outfits-item-pick' src='" + Post_Outfits.IMAGES.pick + "' title='Pick Template' /></div>";
		html += "<div><img class='post-outfits-item-remove' style='opacity: " + opacity + "' src='" + Post_Outfits.IMAGES.remove + "' title='Remove Template' /></div>";
		html += "</div>";

		html += "</div>";

		return html;
	}

}