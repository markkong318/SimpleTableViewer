$(function() {
	
	var App = {};
	App.Models = {};
	App.Collections = {};
	App.Views = {};
	Backbone.Relational.store.addModelScope(App.Models);
	Backbone.Relational.store.addModelScope(App.Collections);
	Backbone.Relational.store.addModelScope(App.Views);

    //DBモデルの情報
    App.Properties = {};
    App.Properties.model_name = model_name;
    App.Properties.model_header = model_header;
	
	//Globalイベント
	App.event = {};
	_.extend(App.event,Backbone.Events);
	
	/**
	 * Editor Relational Model (with pagination)
	 */
	App.Models.EditorRelationalModel = Backbone.RelationalModel.extend({
		defaults: {
			"currentPage": "1",
			"itemsOnPage": "15",
			"items": "0"
		},
		relations: [
		    {
		    	type: Backbone.HasMany,
				key: 'models',
				relatedModel: 'EditorModel',
				collectionType: 'EditorCollection'
		    },
		],
		
		initialize: function(){
			this.on("change:currentPage change:itemsOnPage", this.onChangePage);
			
			this.setUrl(this.get("currentPage"), this.get("itemsOnPage"));
		},
		
		setUrl: function(currentPage, itemsOnPage){
			this.url = "?b=1&page_action=relational_model&model_name=" + App.Properties.model_name + "&currentPage=" + this.get("currentPage") + "&itemsOnPage=" + this.get("itemsOnPage");
		},
		
		onChangePage: function(){			
			this.setUrl(this.get("currentPage"), this.get("itemsOnPage"));
		}
	});
	
	/**
	 * Editor Model
	 */
	App.Models.EditorModel = Backbone.RelationalModel.extend({
        //送信用URL
        url: "",

        //送信用URLベース
        urlDefault: "?b=1&page_action=model",

        //送信できるの属性リスト
        attrWhiteList: [],

        //初期値
		defaults: {
		},
		
		initialize: function(){
			this.buildUrl();
            this.buildWhiteList();
			this.buildRefer();

			this.on("change:id", this.buildUrl);
		},

        //Url生成
		buildUrl: function(){
            this.url = this.urlDefault + "&model_name=" + App.Properties.model_name + "&id=" + this.get('id');
        },

        //セーブの属性
        buildWhiteList: function(){
            var list = [];

            _.each(App.Properties.model_header.headers, function(header){
                if(header['refer_column_key'] == undefined){
                    list.push(header['column_key']);
                }
            });

            this.attrWhiteList = list;
        },

        buildRefer: function(){

            _.each(App.Properties.model_header.headers, function(header){

                if(header['refer_column_key'] != undefined) {
                    if (header['refer_type'] == 'item') {

                        this._getItemName(this.get(header.refer_column_key), _.bind(function (name) {
                            this.set(header.column_key, name);

                            console.log(this.get("item_id")+"<--->"+this.get("item_name"));

                        }, this));
                    }
                }
            }, this);

        },

        _getItemName: function(item_id, callback){
            var url = "?j=1&type=item&item_id=" + item_id;

            $.getJSON(url, function(data) {
                var name = data.name;

                callback(name);
            });
        },

        //Backbone送信機能
        save: function(attrs, options) {
            options || (options = {});

            //here is whitelist or all
            if (this.attrWhiteList != null )
            // Filter the data to send to the server
                whitelisted =  _.pick(attrs, this.attrWhiteList);
            else
                whitelisted = attrs;
            /* it seems that if you override save you lose some headers and the ajax call changes*/
            // get data
            options.data = JSON.stringify(whitelisted);

            if ((this.get('id') == 0) || (this.get('id') == null))
                options.type = "POST"
            else
                options.type = "PUT";


            options.contentType = "application/json";
            //        options.headers =  {
            //            'Accept': 'application/json',
            //            'Content-Type': 'application/json'
            //        },

            // Proxy the call to the original save function
            return  Backbone.Model.prototype.save.call(this, attrs, options);
        }
	});
	
	/**
	 * Editor Collection
	 */
	App.Collections.EditorCollection = Backbone.Collection.extend({
		model: App.Models.EditorModel,
		url: "?b=1"
		
	});
	
	/**
	 * Main View
	 */
	App.Views.MainView = Backbone.View.extend({
		el: "#main_panel",
        template_header: _.template($("#tpl_main_header").html()),

        events: {
            "click .csv_upload": "onCsvUpload"
        },
		
		initialize: function(){
			var _this = this;
			
			_.bindAll(this, "onPageChange");
			
			this.model = new App.Models.EditorRelationalModel();
			this.onReload();
			
			this.listenTo(this.model.get("models"), "add", this.render);
			this.listenTo(this.model.get("models"), "remove", this.render);
			
			App.event.on("main_view:on_reload", this.onReload, this);
			App.event.on("main_view:on_router_change", this.onRouterChange, this);
		},

		render: function(){
			var _this = this;
			
			//内容をクリアする
            this.$(".main_table > thead").html("");
			this.$(".main_table > tbody").html("");


            //headerを出力
            this.$(".main_table > thead").html(this.template_header(App.Properties.model_header));
			
			//modelを出力する
			var i = (this.model.get("currentPage") - 1) * this.model.get("itemsOnPage");
			_.each(this.model.get("models").models, function(editor_model){
				i++;
                editor_model.set("i", i);
				
				this.$(".main_table > tbody").append(new App.Views.EditorView({model: editor_model}).render().el);
			}, this);

			
			//pagination
			this.$(".pagination").pagination({
		        items: _this.model.get("items"),
		        itemsOnPage: _this.model.get("itemsOnPage"),
		        currentPage: _this.model.get("currentPage"),
		        onPageClick: _this.onPageChange,
		        hrefTextPrefix: "#page/",
		        hrefTextSuffix: "/" + _this.model.get("itemsOnPage"),
		        cssStyle: 'light-theme'
		    });

            //CSV操作
            this.$(".csv_download").attr("href", "?b=1&page_action=csv_download&model_name=" + App.Properties.model_name);
            //this.$(".csv_upload").attr("href", "?b=1&page_action=csv_upload&model_name=" + App.Properties.model_name);
			
			return this;
		},
		
		onReload: function(){
			var _this = this;
			this.model.fetch({
				success: function(collection, res, options){
					App.router.navigate("page/" + _this.model.get("currentPage") + "/" + _this.model.get("itemsOnPage"));
					_this.render();
				}
			});
		},
		
		onRouterChange: function(page, count){
			this.model.set({"currentPage": page, "itemsOnPage": count});
			this.onReload();
		},
		
		onPageChange: function(pageNumber, event){
            var _this = this;

			this.model.set("currentPage", pageNumber);
			
			this.model.fetch({
				success: function(){
					App.router.navigate("page/" + _this.model.get("currentPage") + "/" + _this.model.get("itemsOnPage"));
					_this.render();
				}
			});
		},

        onCsvUpload: function(e){
            e.preventDefault();

            upclick({
                element: $(e.target)[0],
                action: "?b=1&&page_action=csv_upload&model_name=" + App.Properties.model_name,
                onstart:
                    function(filename)
                    {
                        alert('Start upload: '+filename);
                    },
                oncomplete:
                    function(response_data)
                    {
                        alert(response_data);
                    }
            });
        }
	});
	
	/**
	 * Editor View
	 */
	App.Views.EditorView = Backbone.View.extend({
		tagName: 'tr',
		template: _.template($("#tpl_main_table").html()),
		
		events: {
			"click .edit": "btnEdit",
			"click .delete": "btnDelete"
		},
		
		initialize: function(){
			
			this.listenTo(this.model, "change", this.onModelChange, this);
		},
		
		render: function(){

            var model_json = {};
            model_json.model = this.model.toJSON();
            model_json.headers = App.Properties.model_header.headers;

			$(this.el).html(this.template(model_json));
			
			return this;
		},

        onModelChange: function(){
			this.render();
		},
		
		btnEdit: function(){
			App.event.trigger("edit_view:show_edit", this.model);
		},
		
		
		
		btnDelete: function(){
			var _this = this;
			
			var options = {
				buttons: {
					confirm: {
						text: '確認',
						action: function(e) {
							_this.model.destroy();
							
							App.event.trigger('main_view:on_reload');
							
							Apprise('close');
						}
					},
					ok: {
						text: '取り消す',
						action: function(e) {
							Apprise('close');
						}
					}
				},
				input: false,
				override: false
			};
			
			Apprise('削除しますか', options);
			
		}
	});
	
	/**
	 * Edit View
	 */
	App.Views.EditView = Backbone.View.extend({
		el: "#edit_panel",
        template_main_table: _.template($("#tpl_edit_table").html()),
		events: {
			"click .edit_confirm": "btnConfirm",
			"click .edit_cancel": "btnCancel"
		},

        /**
         * 初期化
         */
		initialize: function(){
			this.bind('invalid', this.error);
			
			App.event.on('edit_view:show_new', this.showNew, this);
			App.event.on('edit_view:show_edit', this.showEdit, this);
			
			
		},

        /**
         * 画面生成
         */
		render: function(){

            //テンプレート用
            var model_json = {};
            model_json.model = this.model.toJSON();
            model_json.headers = App.Properties.model_header.headers;
            model_json.is_new = this.model.isNew();

            //内容をクリアする
            this.$("#edit_form > table").html("");
            this.$("#edit_form > table").html(this.template_main_table(model_json));

            //タイトル設定と値を初期化
			if(this.model.isNew()){
				this.$(".panel_title").text("新規");

                _.each(App.Properties.model_header.headers, function(header){
                    this.$("[name=" + header.column_key + "]").val(header.edit_default);
                }, this);
			}else{
				this.$(".panel_title").text("編集");

                _.each(App.Properties.model_header.headers, function(header){
                    this.$("[name=" + header.column_key + "]").val(this.model.get(header.column_key));
                }, this);
			}
		},
		
		showNew: function(){
			this.model = new App.Models.EditorModel();
			this.listenTo(this.model, "invalid", this.modelInvalid, this);
			
			this.render();
			
			$(this.el).reveal({
			    animation: 'fadeAndPop',                   //fade, fadeAndPop, none
			    animationspeed: 300,                       //how fast animtions are
			    closeonbackgroundclick: true,              //if you click background will modal close?
			    dismissmodalclass: 'close-reveal-modal'    //the class of a button or element that will close an open modal
			});
		},
		
		showEdit: function(model){
			this.model = model;
			this.listenTo(this.model, "invalid", this.modelInvalid, this);
			
			this.render();
			
			$(this.el).reveal({
			    animation: 'fadeAndPop',                   //fade, fadeAndPop, none
			    animationspeed: 300,                       //how fast animtions are
			    closeonbackgroundclick: true,              //if you click background will modal close?
			    dismissmodalclass: 'close-reveal-modal'    //the class of a button or element that will close an open modal
			});
		},
		
		modelInvalid: function(model, errors){
			var _this = this;
			
			var options = {
				buttons: {
					confirm: {
						text: '確認',
						action: function(e) {
							$(_this.el).reveal();
							Apprise('close');
						}
					}
				},
				input: false,
				override: false
			};
			
			Apprise(errors, options);
			$(this.el).trigger('reveal:close');
		},
		
		btnConfirm: function(){
			var _this = this;

            //セーブ用jsonを作る
            var save_json = {};
            _.each(App.Properties.model_header.headers, function(header){
                var key = header.column_key;
                var value = this.$("[name=" + key + "]").val();

                save_json[key] = value;
            });

            //セーブする
			this.model.save(
                save_json
			,{
				wait:true,
				success: function(collection, res, options){
					App.event.trigger('main_view:on_reload');
					$(_this.el).trigger('reveal:close');
				}
			});
			
		},
		
		btnCancel: function(){
			$(this.el).trigger('reveal:close');
		}
	});
	
	/**
	 * Tool View
	 */
	App.Views.ToolView = Backbone.View.extend({
		el: "#tool_panel",
		events: {
			"click .new": "btnNew"
		},
		
		initialize: function(){
			this.render();
		},
		
		render: function(){
			
		},
		
		btnNew: function(){
			App.event.trigger("edit_view:show_new");
		}
	});
		
	/**
	 * Router
	 */
	App.Router = Backbone.Router.extend({
		routes: {
			"" : "defaultRoute",
			"page/:page/:count" : "showPage"
		},
		
		initialize: function(){
			App.main_view = new App.Views.MainView();
			App.tool_view = new App.Views.ToolView();
			App.edit_view = new App.Views.EditView();
		},
	
		defaultRoute: function(){
			
		},
		
		showPage: function(page, count){
			App.event.trigger("main_view:on_router_change", page, count);
		}
	});
	
	App.router = new App.Router();
	Backbone.history.start();
});