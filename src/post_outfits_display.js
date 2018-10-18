class Post_Outfits_Display {

	static init(){
		yootil.event.after_search(() => {

			this.display.bind(this)();

		});

		this.display();

		$(window).on("resize", this.update_outfit_position);
	}

	static display(){
		let post_ids = proboards.plugin.keys.data[Post_Outfits.PLUGIN_KEY];

		for(let key in post_ids){
			if(!post_ids[key].id){
				continue;
			}

			let $post = $(".post#post-" + parseInt(key, 10));

			if($post.length == 1){
				this.create_post_outfit(parseInt(key, 10), $post, $(".post:first").css("width"), post_ids[key]);
			}
		}
	}

	static create_post_outfit(id, $post, width, outfit){
		let outfit_html = "<div data-post-id-outfit='post-" + id + "' class='post-outfits-post-item-wrapper'><div class='post-outfits-post-item'>";

		outfit_html += "<div class='post-outfits-post-item-title' title='" + Post_Outfits.SETTINGS.description + "'>" + Post_Outfits.SETTINGS.title + "</div>";

		let img = "<em>No Image</em>";
		let has_img = false;

		if(outfit.i){
			img = "<img src='" + yootil.html_encode(outfit.i) + "' />";
			has_img = true;
		}

		let text_container = "";
		let img_container = "<div class='post-outfits-post-item-image'>" + img + "</div>";

		if(outfit.t.length > 0){
			let parser = new Post_Outfits_Parser();

			text_container = "<div class='post-outfits-post-item-text'>" + parser.parse(outfit.t) + "</div>";
		} else {
			img_container = "<div class='post-outfits-post-item-image post-outfits-post-item-image-no-border'>" + img + "</div>";
		}

		outfit_html += img_container;
		outfit_html += text_container;

		outfit_html += "</div></div>";

		let $outfit = $(outfit_html);

		$outfit.find(".post-outfits-post-item-title").tipTip({

			defaultPosition: "left",
			maxWidth: "auto"

		});

		if(has_img){
			$outfit.find(".post-outfits-post-item-image img").tipTip({

				defaultPosition: "left",
				maxWidth: "auto",
				content: "<div class='post-outfits-post-item-image-hover'>" + img + "</div>"

			});

			$outfit.find(".post-outfits-post-item-image img").on("click", function(e){
				let src = $(this).attr("src");

				if(src.match(/^(https?:\/\/|www\.)/i)){
					window.open($(this).attr("src"));
				}

				e.stopPropagation();
			})
		}

		if(yootil.user.is_staff()){
			$outfit.find(".post-outfits-post-item-title").on("click", function(){
				pb.window.confirm("Remove outfit from this post?", () => {

					let post_id = parseInt($(this).parent().parent().attr("data-post-id-outfit").split("-")[1], 10);

					yootil.key.set(Post_Outfits.PLUGIN_KEY, "", post_id);
					$(this).parent().parent().remove();

				});
			})
		}

		$outfit.find(".post-outfits-post-item").css("top", parseInt(Post_Outfits.SETTINGS.top_offset, 10) + "px");

		$post.find("td:first").prepend($outfit.css({

			left: (parseInt(width, 10) + parseInt(Post_Outfits.SETTINGS.left_offset, 10) + $post.position().left)

		}));
	}

	static update_outfit_position(){
		$(".post-outfits-post-item-wrapper").each(function(){
			let $post = $(".post#" + $(this).attr("data-post-id-outfit"));

			if($post.length == 1){
				$(this).css({

					left: (parseInt($post.css("width"), 10) + parseInt(Post_Outfits.SETTINGS.left_offset, 10) + $post.position().left)

				});
			}
		})
	}

}