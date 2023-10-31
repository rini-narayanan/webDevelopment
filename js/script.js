$(function(){ // same as document.addEventListener("DomContentLoaded", function(){})

	$(".navbar-toggle").blur(function(event){ // same as document.getElementByClassName('.navbar-toggle').addEventListener('blur', function(){})
		var screenwidth = window.innerWidth;
		if(screenwidth < 768){
			$("#navbar-collapse1").collapse('hide')
		}
	});
});

(function(global){

	var myObj = {};
	var homeHtml = "snippets/home-snippet.html";
	var menuCategoriesUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
	var menuCategoryTitleHtml = "snippets/menu-category-title-snippet.html";
	var menuCategoryHtml = "snippets/menu-category-snippet.html";
	var menuItemsUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
	var menuOrSpecialItemsTitleHtml = "snippets/menu-items-title-snippet.html";
	var menuOrSpecialItemsHtml = "snippets/menu-items-snippet.html";
	var specialItemsUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/SP.json";
	var aboutHtml = "snippets/about.html";
	var awardsHtml = "snippets/awards.html";

	var insetHtml = function(selector, html){
		var tarEle = document.querySelector(selector);
		tarEle.innerHTML = html;
	}

	var showLoading = function(selector){
			var html = "<div class='text-center'>";
			html += "<img src='images/ajax-loader.gif'></div>";
			insetHtml(selector, html);
	}

	var insertProperty = function(content, propName, propValue ){
		var propToReplace = "{{"+propName+"}}";
		content = content.replace(new RegExp(propToReplace,'g'), propValue);
		return content;
	}

	var switchMenuToActive = function(isMenu){
		var classNames = document.getElementById('navHomeButton').classList;
		var menuClassNames = document.getElementById('navMenuButton').classList;
		if(isMenu){
			document.getElementById('navHomeButton').classList.remove('active');
			document.getElementById('navMenuButton').classList.add('active');
		}else{
			document.getElementById('navHomeButton').classList.add('active');
			document.getElementById('navMenuButton').classList.remove('active');
		}
	}

	// On page loahttps://coursera-jhu-default-rtdb.firebaseio.com/categories.jsond; (before images or CSS)
	document.addEventListener("DOMContentLoaded", function(){
		showLoading(".main-section");
		setTimeout(function(){
			myObj.loadMainPage();
			},2000)
		});

	myObj.loadMainPage = function(){
		$ajaxUtils.sendGetRequest(homeHtml, function(respText){
			switchMenuToActive(false);
				document.querySelector(".main-section").innerHTML = respText;
				}, false);
	}
	// Load the menu categories view
	myObj.loadMenuCategories = function(){
		showLoading(".main-section");
		$ajaxUtils.sendGetRequest(menuCategoriesUrl, buildMenuCategoriesHtml); // asyn call by default 3rs param is true
	}

	function buildMenuCategoriesHtml(categoriesResponse){
		$ajaxUtils.sendGetRequest(menuCategoryTitleHtml, function(menuTitleResp){
			$ajaxUtils.sendGetRequest(menuCategoryHtml, function(menuCategoryResp){
				switchMenuToActive(true);
				var categoriesView = buildCategoriesView(categoriesResponse, menuTitleResp, menuCategoryResp);
				insetHtml(".main-section",categoriesView);
			},false)
		}, false)
	}

	function buildCategoriesView(categoriesJsonResp, menuTitleContent, menuCategoriesContent){
		var finalHtml = menuTitleContent;
		finalHtml += "<section class='row'>";

		for(var i=0;  i<categoriesJsonResp.length; i++){
			var categoryHtml = menuCategoriesContent;
			categoryHtml = insertProperty(categoryHtml, "name", categoriesJsonResp[i].name );
			categoryHtml = insertProperty(categoryHtml, "short_name", categoriesJsonResp[i].short_name );
			finalHtml += categoryHtml;
		}
		finalHtml += "</section>";
		return finalHtml;
	}

	myObj.loadMenuItems = function(event, categoryShortName){
		event.preventDefault();
		showLoading(".main-section");
		$ajaxUtils.sendGetRequest(menuItemsUrl + categoryShortName+ ".json", buildMenuItemsHtml);

	}

	function buildMenuItemsHtml(categoryItemsResponse){
		$ajaxUtils.sendGetRequest(menuOrSpecialItemsTitleHtml, function(menuItemTitleRes){
			$ajaxUtils.sendGetRequest(menuOrSpecialItemsHtml, function(menuItemsRes){
				switchMenuToActive(true);
				var menuItemsView = buildMenuOrSpecialItemsView(categoryItemsResponse,menuItemTitleRes,menuItemsRes);
				insetHtml(".main-section",menuItemsView);
			}, false);
		}, false);
	}

	function buildMenuOrSpecialItemsView(menuItemsRes, menuItemsTitleHtml, menuItemsHtml){
		menuItemsTitleHtml = insertProperty(menuItemsTitleHtml,'name',menuItemsRes.category.name);
		menuItemsTitleHtml = insertProperty(menuItemsTitleHtml,'special_instructions',menuItemsRes.category.special_instructions);
		var finalHtml = menuItemsTitleHtml;
		finalHtml += "<section class='row'>";

		var catShortName = menuItemsRes.category.short_name;
		for(var i=0;  i<menuItemsRes.menu_items.length; i++){
			var itemsHtml = menuItemsHtml;
			itemsHtml = insertProperty(itemsHtml, 'short_name',menuItemsRes.menu_items[i].short_name );
			itemsHtml = insertProperty(itemsHtml, 'catShort_name',catShortName );
			itemsHtml = insertProperty(itemsHtml, 'name',menuItemsRes.menu_items[i].name );
			itemsHtml = insertProperty(itemsHtml, 'description',menuItemsRes.menu_items[i].description );
			
			itemsHtml = insertItemsPrice(itemsHtml, 'price_small', menuItemsRes.menu_items[i].price_small);
			itemsHtml = insertItemsPortionName(itemsHtml, 'small_portion_name', menuItemsRes.menu_items[i].small_portion_name);

			itemsHtml = insertItemsPrice(itemsHtml, 'price_large', menuItemsRes.menu_items[i].price_large);
			itemsHtml = insertItemsPortionName(itemsHtml, 'large_portion_name', menuItemsRes.menu_items[i].large_portion_name);
		
			// Add clearfix after every second menu item
			if(i % 2 != 0){
				itemsHtml+= "<div class='clearfix visible-lg-block visible-md-block'></div>"; 
			}
			finalHtml += itemsHtml;
		}
		finalHtml += "</section>"
		return finalHtml;

	}

	function insertItemsPrice(htmlContent, pricePropName, priceValue){
		if(!priceValue){
			return insertProperty(htmlContent, pricePropName,"");
		} else{
			priceValue = "$" + priceValue.toFixed(2);
			return insertProperty(htmlContent, pricePropName,priceValue);
		}
	}

	function insertItemsPortionName(htmlContent, portionPropName, portionValue){
		if(!portionValue){
			return insertProperty(htmlContent, portionPropName,"");
		} else{
			portionValue = "(" + portionValue + ")";
			return insertProperty(htmlContent, portionPropName,portionValue);
		}
	}

	myObj.loadSpecials = function(){
			showLoading(".main-section");
			$ajaxUtils.sendGetRequest(specialItemsUrl, buildSpecaialItemsHtml);
	}

	function buildSpecaialItemsHtml(specialItemsResp){
		$ajaxUtils.sendGetRequest(menuOrSpecialItemsTitleHtml,function(specialTitleRes){
			$ajaxUtils.sendGetRequest(menuOrSpecialItemsHtml,function(specialItemsRes){
				switchMenuToActive(false);
				var specialItemsContent = buildMenuOrSpecialItemsView(specialItemsResp,specialTitleRes,specialItemsRes)
				insetHtml(".main-section",specialItemsContent);
			},false);
		},false);
	}

	myObj.loadAboutPage = function(){
		showLoading(".main-section");
		$ajaxUtils.sendGetRequest(aboutHtml, function(respText){
			switchMenuToActive(false);
			document.querySelector(".main-section").innerHTML = respText;
		}, false);

	}

	myObj.loadAwardsPage = function(){
		showLoading(".main-section");
		$ajaxUtils.sendGetRequest(awardsHtml, function(respText){
			switchMenuToActive(false);
			document.querySelector(".main-section").innerHTML = respText;
		}, false);

	}

	global.$myObj = myObj;

})(window);