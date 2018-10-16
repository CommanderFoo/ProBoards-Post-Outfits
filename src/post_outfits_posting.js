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
		let $the_form = (this.editing)? yootil.form.edit_post_form() : yootil.form.post_form();

		if($the_form.length){
			$the_form.on("submit", () => {

				this._submitted = true;
				this.set_on();

			});
		}
	}

	static set_on(){
		if((this.new_thread || this.new_post || this.editing) && this._submitted){
			let hook = (this.new_thread)? "thread_new" : ((this.editing)? "post_edit" : "post_new");
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

	static use_outfit(content = ""){

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