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