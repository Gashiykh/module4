$(function () { 
  // Событие blur для скрытия навигационного меню на малых экранах
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });
});

(function (global) {
  var dc = {};

  var homeHtmlUrl = "snippets/home-snippet.html";
  var allCategoriesUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
  var menuItemsUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";

  // Вставка HTML в указанный элемент
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  // Показ иконки загрузки
  var showLoading = function (selector) {
    var html = "<div class='text-center'><img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  // Замена {{propName}} на propValue в строке
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    return string.replace(new RegExp(propToReplace, "g"), propValue);
  };

  // Смена активной кнопки меню
  var switchMenuToActive = function () {
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;

    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") === -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };

  // При загрузке страницы
  document.addEventListener("DOMContentLoaded", function (event) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      buildAndShowHomeHTML,
      true // JSON формат
    );
  });

  // Построение и показ главной страницы
  function buildAndShowHomeHTML(categories) {
    $ajaxUtils.sendGetRequest(
      homeHtmlUrl,
      function (homeHtml) {
        // Выбор случайной категории
        var chosenCategory = chooseRandomCategory(categories);
        var chosenCategoryShortName = chosenCategory.short_name;

        // Замена {{randomCategoryShortName}} в HTML
        var homeHtmlToInsertIntoMainPage = insertProperty(
          homeHtml,
          "randomCategoryShortName",
          "'" + chosenCategoryShortName + "'" // Добавляем кавычки для корректного синтаксиса
        );

        insertHtml("#main-content", homeHtmlToInsertIntoMainPage);
      },
      false // Получаем HTML, а не JSON
    );
  }

  // Выбор случайной категории
  function chooseRandomCategory(categories) {
    var randomArrayIndex = Math.floor(Math.random() * categories.length);
    return categories[randomArrayIndex];
  }

  // Построение и показ HTML для страницы категорий
  function buildAndShowCategoriesHTML(categories) {
    var categoriesTitleHtml = "snippets/categories-title-snippet.html";
    var categoryHtml = "snippets/category-snippet.html";

    $ajaxUtils.sendGetRequest(
      categoriesTitleHtml,
      function (categoriesTitleHtml) {
        $ajaxUtils.sendGetRequest(
          categoryHtml,
          function (categoryHtml) {
            switchMenuToActive();

            var categoriesViewHtml = buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml);
            insertHtml("#main-content", categoriesViewHtml);
          },
          false
        );
      },
      false
    );
  }

  // Построение HTML для отображения категорий
  function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml) {
    var finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";

    for (var i = 0; i < categories.length; i++) {
      var html = categoryHtml;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;

      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);

      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // Функция для загрузки категорий
  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      buildAndShowCategoriesHTML
    );
  };

  // Функция для загрузки пунктов меню
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort + ".json",
      buildAndShowMenuItemsHTML
    );
  };

  // Построение и показ пунктов меню
  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    var menuItemsTitleHtml = "snippets/menu-items-title.html";
    var menuItemHtml = "snippets/menu-item.html";

    $ajaxUtils.sendGetRequest(
      menuItemsTitleHtml,
      function (menuItemsTitleHtml) {
        $ajaxUtils.sendGetRequest(
          menuItemHtml,
          function (menuItemHtml) {
            switchMenuToActive();

            var menuItemsViewHtml = buildMenuItemsViewHtml(
              categoryMenuItems,
              menuItemsTitleHtml,
              menuItemHtml
            );

            insertHtml("#main-content", menuItemsViewHtml);
          },
          false
        );
      },
      false
    );
  }

  // Построение HTML для отображения пунктов меню
  function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml) {
    menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
    menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "special_instructions", categoryMenuItems.category.special_instructions);

    var finalHtml = menuItemsTitleHtml;
    finalHtml += "<section class='row'>";

    var menuItems = categoryMenuItems.menu_items;
    var catShortName = categoryMenuItems.category.short_name;
    for (var i = 0; i < menuItems.length; i++) {
      var html = menuItemHtml;
      html = insertProperty(html, "short_name", menuItems[i].short_name);
      html = insertProperty(html, "catShortName", catShortName);
      html = insertProperty(html, "name", menuItems[i].name);
      html = insertProperty(html, "description", menuItems[i].description);

      if (i % 2 !== 0) {
        html += "<div class='clearfix visible-lg-block visible-md-block'></div>";
      }

      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  global.$dc = dc;

})(window);
