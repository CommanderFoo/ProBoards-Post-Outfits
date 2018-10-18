class Post_Outfits {

	static init(){
		this.PLUGIN_ID = "pd_post_outfits";
		this.PLUGIN_KEY = "pd_post_outfits";

		this.SETTINGS = {};
		this.IMAGES = {};

		this.setup();

		$(this.ready.bind(this));
	}

	static ready(){
		let location_check = (
			yootil.location.recent_posts() ||
			yootil.location.search_results() ||
			yootil.location.thread()
		);

		if(location_check && this.view_in_category()){
			Post_Outfits_Display.init();
		}

		if(yootil.location.posting() || yootil.location.editing()){
			if(this.can_use()){
				Post_Outfits_Posting.init();
			}
		}
	}



	static setup(){
		let plugin = pb.plugin.get(this.PLUGIN_ID);

		if(plugin && plugin.settings){
			this.SETTINGS = plugin.settings;
			this.IMAGES = plugin.images;
		}
	}

	static can_use(){
		if(!this.SETTINGS.groups.length){
			return false;
		}

		let grps = yootil.user.group_ids();

		if(Array.isArray(grps) && grps.length){
			for(let id of grps){
				if($.inArrayLoose(parseInt(id, 10), this.SETTINGS.groups) > -1){
					return true;
				}
			}
		}

		return false;
	}

	static view_in_category(){
		if(!this.SETTINGS.categories.length || !yootil.page.category.id()){
			return false;
		}

		if($.inArrayLoose(parseInt(yootil.page.category.id(), 10), this.SETTINGS.categories) > -1){
			return true;
		}

		return false;
	}

}

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

class Post_Outfits_Posting {

	static init(){
		this.key_id = (yootil.user.logged_in())? ("_" + parseInt(yootil.user.id(), 10)) : "";
		this.new_thread = (yootil.location.posting_thread())? true : false;
		this.new_post = (!this.new_thread)? true : false;
		this.editing = (yootil.location.editing())? true : false;
		this.hook = (this.new_thread)? "thread_new" : "post_new";

		this.saved_outfits = this.load_saved_outfits();

		this.build();
		this.selected_outfit = this.get_selected_outfit();
	}

	static build(){
		let $wrapper = $("#post-outfits");
		let has_wrapper = ($wrapper.length == 1)? true : false;
		let $container = yootil.create.container("Post Outfits", this.build_saved_post_outfits());

		this.bind_events($container);

		if($container.find(".post-outfits-item").length > 1){
			$container.find(".post-outfits-item:not(:last) textarea").off("keyup").on("keyup", function(){
				let $item = $(this).closest(".post-outfits-item");

				$item.find(".post-outfits-item-asterisk").addClass("post-outfits-item-asterisk-unsaved");
			});
		}

		if(!has_wrapper){
			$wrapper = $("<div id='post-outfits'></div>");
		}

		$wrapper.append($container);

		if(!has_wrapper){
			$wrapper.insertAfter($(".container.wysiwyg-area"));
		}
	}

	static bind_key_event(){
		let $the_form = null;

		if(this.editing){
			if(yootil.location.editing_thread()){
				$the_form = yootil.form.edit_thread();
			} else {
				$the_form = yootil.form.edit_post();
			}
		} else {
			$the_form = yootil.form.post_form();
		}

		if($the_form.length){
			$the_form.on("submit", () => {

				this._submitted = true;
				this.set_on();

			});
		}
	}

	static get_hook(){
		let hook = "";

		if(this.new_thread){
			hook = "thread_new";
		} else if(this.editing){
			if(yootil.location.editing_thread()){
				hook = "thread_edit";
			} else {
				hook = "post_edit";
			}
		} else {
			hook = "post_new";
		}

		return hook;
	}

	static set_on(){
		if((this.new_thread || this.new_post || this.editing) && this._submitted){
			let hook = this.get_hook();
			let outfit = "";

			if(this.selected_outfit != null && this.saved_outfits[this.selected_outfit] != null){
				outfit = this.saved_outfits[this.selected_outfit];
				outfit.id = this.selected_outfit;
			}

			yootil.key.set_on(Post_Outfits.PLUGIN_KEY, outfit, null, hook);
		}
	}

	static bind_events($elem){
		if(yootil.location.posting() || (yootil.location.editing_thread() || yootil.location.editing_post())){
			this.bind_key_event();
		}

		$elem.find(".post-outfits-item-pick").click(function(){
			let $item = $(this).closest(".post-outfits-item");
			let id = $item.attr("data-post-outfits-id");

			$(".post-outfits-item-selected").removeClass("post-outfits-item-selected");

			$item.addClass("post-outfits-item-selected");

			Post_Outfits_Posting.selected_outfit = parseInt(id, 10);
		});

		$elem.find(".post-outfits-item-content textarea").on("keyup", function(){
			let $area = $(this);

			if($area.val().length){
				$area.off("keyup");

				let $item = $(this).closest(".post-outfits-item");
				let $parent = $item.parent();

				$item.find(".post-outfits-item-asterisk").addClass("post-outfits-item-asterisk-unsaved");
				$item.find(".post-outfits-item-remove").addClass("post-outfits-item-bounce-in");

				let $empty_item = $(new Post_Outfits_Item().create({

					i: "",
					t: ""

				}, (+ new Date()))).addClass("post-outfits-item-bounce-in");

				Post_Outfits_Posting.bind_events($empty_item);

				$parent.append($empty_item);
			}
		});

		$elem.find(".post-outfits-item-remove").on("click", function(){
			if($(this).css("opacity") <= 0.4){
				return;
			}

			let $item = $(this).closest(".post-outfits-item");
			let $parent = $item.parent();
			let id = $item.attr("data-post-outfits-id");

			$item.addClass("post-outfits-item-roll-out");

			setTimeout(() => {
				$item.remove();
				Post_Outfits.remove_outfit(id);

				if($parent.find("div").length == 0){
					let $empty_item = $(new Post_Outfits_Item().create({

						i: "",
						t: ""

					}, (+ new Date()))).addClass("post-outfits-item-bounce-in");

					Post_Outfits_Posting.bind_events($empty_item);

					$parent.append($empty_item);
				}
			}, 600);

		});

		$elem.find(".post-outfits-item-save").on("click", function(){
			let $item = $(this).closest(".post-outfits-item");
			let id = $item.attr("data-post-outfits-id");

			$item.find(".post-outfits-item-asterisk").removeClass("post-outfits-item-asterisk-unsaved");

			let img = $item.find(".post-outfits-item-image-url input").val();
			let txt = $item.find(".post-outfits-item-content textarea").val();

			if(img.length > 10){
				$item.find(".post-outfits-item-preview-img").attr("src", yootil.html_encode(img));
			}

			$(this).addClass("post-outfits-item-saved-spin");

			setTimeout(() => {

				$(this).removeClass("post-outfits-item-saved-spin");

			}, 1100);

			Post_Outfits_Posting.save_outfit(id, img, txt);
			Post_Outfits_Posting.saved_outfits = Post_Outfits_Posting.load_saved_outfits();
		});

		$elem.find(".post-outfits-item-picture").on("click", function(){
			let $item = $(this).closest(".post-outfits-item");
			let $url = $item.find(".post-outfits-item-image-url");

			if($url.hasClass("post-outfits-item-image-url-show")){
				$url.removeClass("post-outfits-item-image-url-show");
				$url.addClass("post-outfits-item-image-url-hide");
			} else {
				$url.removeClass("post-outfits-item-image-url-hide");
				$url.addClass("post-outfits-item-image-url-show");
			}
		});

		$elem.find(".post-outfits-item-image-url input").on("keyup", function(){
			let $item = $(this).closest(".post-outfits-item");
			let $parent = $item.parent();

			$item.find(".post-outfits-item-asterisk").addClass("post-outfits-item-asterisk-unsaved");
		});
	}

	static build_saved_post_outfits(){
		let outfits = "<div class='post-outfits-list'>";

		for(let key in this.saved_outfits){
			if(this.saved_outfits.hasOwnProperty(key)){
				outfits += new Post_Outfits_Item().create(this.saved_outfits[key], key, true);
			}
		}

		outfits += new Post_Outfits_Item().create({

			i: "",
			t: ""

		}, (+ new Date()), false);

		outfits += "</div>";

		return outfits;
	}

	static load_saved_outfits(){
		let tpls = localStorage.getItem("post_outfits" + this.key_id);

		if(tpls && tpls.length){
			return JSON.parse(tpls);
		}

		return {};
	}

	static remove_outfit(id){
		let outfits = this.load_saved_outfits();

		if(outfits[id]){
			delete outfits[id];
			localStorage.setItem("post_outfits" + this.key_id, JSON.stringify(outfits));
		}
	}

	static save_outfit(id, img = "", txt = ""){
		let outfits = this.load_saved_outfits();

		outfits[id] = {

			i: img,
			t: txt || ""

		};

		localStorage.setItem("post_outfits" + this.key_id, JSON.stringify(outfits));
	}

	static get_selected_outfit(){
		if(this.editing){
			let post_id = parseInt(yootil.page.post.id(), 10);
			let outfit = yootil.key.value(Post_Outfits.PLUGIN_KEY, post_id);

			if(outfit && outfit.id){
				let $selected = $(".post-outfits-item[data-post-outfits-id=" + outfit.id + "]");

				if($selected.length == 1){
					$selected.addClass("post-outfits-item-selected");
				}

				return outfit.id;
			}
		}

		return null;
	}

}

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

class Post_Outfits_Parser {

	constructor(){
		this.parser_lookup = [

			{
				open_bbc: "[b]",
				close_bbc: "[/b]",
				open_html: "<b>",
				close_html: "</b>"
			},

			{
				open_bbc: "[i]",
				close_bbc: "[/i]",
				open_html: "<em>",
				close_html: "</em>"
			},

			{
				open_bbc: "[s]",
				close_bbc: "[/s]",
				open_html: "<s>",
				close_html: "</s>"
			},

			{
				open_bbc: "[u]",
				close_bbc: "[/u]",
				open_html: "<u>",
				close_html: "</u>"
			},

			{
				open_bbc: "[center]",
				close_bbc: "[/center]",
				open_html: "<div style='text-align: center'>",
				close_html: "</div>"
			}

		];
	}

	parse(str = ""){
		let html = yootil.html_encode(str);

		for(let i = 0; i < this.parser_lookup.length; ++ i){
			let item = this.parser_lookup[i];

			html = html.replace(item.open_bbc, item.open_html);
			html = html.replace(item.close_bbc, item.close_html);
		}

		html = html.replace(/\n|\r/g, "<br />");

		return html;
	}

}

Post_Outfits.init();