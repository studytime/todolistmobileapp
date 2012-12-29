var result;
function displaylocation() {

	$("#loc").each(function(index) {
		var id = $(this).attr("name")
		alert(id)
		$("#geoloc" + id).html(result[0].formatted_address + " " + city.short_name + " " + city.long_name);
	})
}

function httpGet(theUrl) {
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false);
	xmlHttp.send(null);
	return xmlHttp.responseText;
}

function geolocation(loca) {
	return xyz;
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

_.templateSettings = {
	interpolate : /\{\{(.+?)\}\}/g,
	escape : /\{\{-(.+?)\}\}/g,
	evaluate : /\{\{=(.+?)\}\}/g
};

var browser = {
	android : /Android/.test(navigator.userAgent)
}
browser.iphone = !browser.android

var app = {
	model : {},
	view : {},
}

var backbone = {
	model : {},
	view : {},
}

backbone.init = function() {

	$("#addItem").hide()
	$("#list").hide()
	var scrollContent = {
		scroll : function() {
			var self = this
			setTimeout(function() {
				if (self.scroller) {
					self.scroller.refresh()
				} else {
					self.scroller = new iScroll($("div[data-role='content']")[0])
				}
			}, 1)
		}
	}

	backbone.model.State = Backbone.Model.extend(_.extend({
		defaults : {
			items : 'loading'
		},
	}))

	//////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////Model for ID, Text, Location, date and time////////////////////
	backbone.model.Item = Backbone.Model.extend(_.extend({
		defaults : {
			id : '',
			text : '',
			created : new Date().getTime(),
			location : result

		},

		initialize : function() {
			var self = this
			_.bindAll(self)
		},
		render : function() {

			$("#add").hide()
			$("#close").show()
			//$("#hideTaskList").show()
			//$("#list").hide()
		}
	}))
	////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////Model Collection////////////////////////////////////////////
	backbone.model.Items = Backbone.Collection.extend(_.extend({
		model : backbone.model.Item,
		//localStorage: new Store("items"),
		url : '/api/rest/todo',

		initialize : function() {
			var self = this
			_.bindAll(self)
			self.count = 0
			self.geolocation()
			self.on('change', function() {
				self.count = self.length
			})
		},
		//Showing Added items
		showadditem : function() {
			app.view.addItem.render()
		},
		// Show main page
		showMain : function() {
			$("#add").hide()
			$("#close").hide()
			$("#addItem").slideUp()
			$("#updateItem").slideUp()
			$("#list").slideDown()
			$("#hideTaskList").show()
			$("#myPic").hide()
			//app.view.head.render()
		},
		// Hide main page
		HideMain : function() {
			$("#add").show()
			$("#close").show()
			$("#myPic").show()
			$("#addItem").slideUp()
			$("#updateItem").slideUp()
			$("#list").hide()
			$("#hideTaskList").hide()
			//app.view.head.render()
		},
		// Add item into database
		additem : function() {
			var self = this
			var tmp = $("#loc").name
			self.geolocation()
			var item = new backbone.model.Item({
				id : self.count + 1,
				text : $("#itemName").val(),
				created : new Date().getTime(),
				//location : result
			})
			//Create dabase itam name, randam numeber for id, location
			httpGet("/api/rest/create/" + $("#itemName").val() + "/" + new Date().getTime() + "/" + result)
			$("#itemName").val("")
			//$("#addItem").slideUP()
			//$("#close").hide()
			//$("#add").show()
			self.add(item)
			self.count++
			item.save()
			app.model.items.fetch({
				success : function() {
					app.model.state.set({
						items : 'loaded'
					})
					app.view.list.render()
					console.log("loaded")
				}
			})
		},
		geolocation : function() {
			var self = this
			var geocoder;
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(successFunction);
			}
			//Get the latitude and the longitude;
			function successFunction(position) {
				var lat = position.coords.latitude;
				var lng = position.coords.longitude;
				codeLatLng(lat, lng)
			}

			function codeLatLng(lat, lng) {
				var latlng = new google.maps.LatLng(lat, lng);
				geocoder = new google.maps.Geocoder();
				geocoder.geocode({
					'latLng' : latlng
				}, function(results, status) {
					//find country name
					console.log(results)
					for (var i = 0; i < results[0].address_components.length; i++) {
						for (var b = 0; b < results[0].address_components[i].types.length; b++) {
							//there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
							//this is the object you are looking for
							city = results[0].address_components[i];
							//$("#geoloc").html(results[0].formatted_address + " " + city.short_name + " " + city.long_name);
							break;
						}
					}
					result = results[0].formatted_address + " " + city.short_name + " " + city.long_name
					//displaylocation()
				});
			}

		},
		print : function() {
			var self = this
			self.each(function(item) {
				logargs(item.toJSON())
			})
		}
	}))
	////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////header view//////////////////////////////////////////////
	backbone.view.Head = Backbone.View.extend(_.extend({
		//Event
		events : {
			'click #add' : function() {
				var self = this
				self.items.showadditem()
			},
			'click #close' : function() {
				var self = this;
				self.items.showMain()

			},
			'click #hideTaskList' : function() {
				var self = this;
				self.items.HideMain()

			},
		},
		//Initialization
		initialize : function(items) {
			var self = this
			_.bindAll(self)
			self.items = items
			self.setElement("div[data-role='header']")
			self.elem = {
				add : self.$el.find('#add'),
				title : self.$el.find('h1')
			}

			self.tm = {
				title : _.template(self.elem.title.html())
			}
			self.elem.add.hide()
			app.model.state.on('change:items', self.render)
			self.items.on('add', self.render)
			self.items.on('remove', self.render)
			$("#close").show()
		},
		//Rendering
		render : function() {
			var self = this
			$("#add").show()
			//$("#list").slideDown()
			$("#addItem").hide()
			var loaded = 'loaded' == app.model.state.get('items')
			if (loaded) {
			}
		}
	}))
	////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////Add Item view////////////////////////////////////////////////
	backbone.view.AddItem = Backbone.View.extend(_.extend({
		//Event
		events : {
			'tap #item' : function() {
				var self = this;
				self.items.additem()
			}
		},
		//initialization
		initialize : function(items) {
			var self = this
			_.bindAll(self)
			self.items = items
			self.setElement("div[data-role='content']")
		},
		//Render
		render : function() {
			$("#myPic").show()
			$("#addItem").show()
			//$("#add").hide()
			$("#close").show()
			$("#hideTaskList").hide()
			$("#list").hide()
		}
	}))
	//////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////List view///////////////////////////////////////////////////////
	backbone.view.List = Backbone.View.extend(_.extend({
		//events handeling for delete, edit and location
		events : {
			'tap #ditem' : function(a) {
				var self = this;
				var tmp = a.target.name
				self.removeitem(tmp)
			},
			'tap #eitem' : function(b) {
				var self = this;
				var tmp = b.target.name
				self.changeitem(tmp)
			},
			'tap #loc' : function(c) {
				var self = this;
				var tmp = c.target.name
			}
		},
		//initialization
		initialize : function(items) {
			var self = this
			_.bindAll(self)
			self.setElement('#list')
			self.tm = {
				item : _.template(self.$el.html()),
			}
			self.items = items
			self.items.on('add', self.appenditem)
		},
		//rendering
		render : function() {
			var self = this
			self.$el.empty()
			self.items.each(function(item) {
				self.appenditem(item)
			})
		},
		//display text note with location
		appenditem : function(item) {
			var self = this
			var html = self.tm.item(item.toJSON())
			self.$el.append(html)
			self.scroll()
		},
		//Delete Item from data base
		removeitem : function(id) {
			var self = this
			httpGet("/api/rest/del/" + id)
			app.model.items.fetch({
				success : function() {
					app.model.state.set({
						items : 'loaded'
					})
					self.render()
					console.log("loaded")
				}
			})
		},
		//Update item from database
		changeitem : function(id) {
			var self = this
			var item = self.items.get(id)
			$("#uitemName").val(item.get("text"))
			$("#updateItem").slideDown()
			$("#close").hide()
			$("#add").hide()
			$("#uitem").click(function() {
				item.set("text", $("#uitemName").val())
				httpGet("/api/rest/update/" + id + "/" + $("#uitemName").val())
				self.render()
				$("#updateItem").slideUp()
				$("#close").hide()
				$("#add").show()
			})
		}
	}, scrollContent))
}
app.init = function() {
	console.log('start init')
	backbone.init()
	app.model.state = new backbone.model.State()
	app.model.items = new backbone.model.Items()
	app.view.head = new backbone.view.Head(app.model.items)
	app.view.head.render()
	app.view.list = new backbone.view.List(app.model.items)
	app.view.addItem = new backbone.view.AddItem(app.model.items)
	app.view.list.render()
	app.model.items.fetch({
		success : function() {
			app.model.state.set({
				items : 'loaded'
			})
			app.view.list.render()
			console.log("loaded")
		}
	})

	console.log('end init')
}
$(app.init)