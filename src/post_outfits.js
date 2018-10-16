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