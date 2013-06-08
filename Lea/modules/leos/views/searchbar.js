define(['backbone', 'underscore', 'handlebars', 'text!../templates/searchbar.html'],
function(Backbone, _, Handlebars, SearchBarTemplate) {
	return Backbone.View.extend({
		el: '#search',
		template: Handlebars.compile(SearchBarTemplate),
		initialize: function() {
			this.render();
		},
		render: function() {
			this.$el.html(this.template({}));
		},
		events: {
			'change': 'updateOnChange',
			'keyup': 'searchOnEnter',
			'click .btn': 'search'
		},
		updateOnChange: function(e) {
			this.model.set(e.target.id.substring(7), e.target.value);
		},
		searchOnEnter: function(e) {
			((e.which || e.keyCode) === 13) && this.search(e);
		},
		search: function(e) {
			e.preventDefault();
			var attr;
			if(!_.isEqual(attr = this.model.toJSON(), this.model._attributes)) {
				this.model._attributes = attr;

				App.Leos.fetch({data: attr, reset: true});

			}
		}
	});
});