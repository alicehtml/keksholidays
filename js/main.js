/**
 * @fileoverview Список отелей: загрузка, включение фильтрации и постраничная
 * отрисовка
 * @author Igor Alexeenko (igor.alexeenko@htmlacademy.ru)
 */


'use strict';


require([
  './filter/filter',
  './filter/filter-type',
  './host',
  './load',
  './utils'
], function(filter, FilterType, getHostElement, load, utils) {
  var filtersContainer = document.querySelector('.hosts-filters');
  var hostsContainer = document.querySelector('.hosts-list');
  var footer = document.querySelector('footer');


  /** @constant {number} */
  var PAGE_SIZE = 16;


  /** @constant {number} */
  var SCROLL_TIMEOUT = 100;


  /** @constant {Filter} */
  var DEFAULT_FILTER = FilterType.ALL;


  /** @constant {string} */
  var ACTIVE_FILTER_CLASSNAME = 'host-filter-active';


  /** @constant {string} */
  var HOSTS_LOAD_URL = 'data/hosts.json';


  /**
   * Изначальный список загруженных отелей. Используется для фильтрации.
   * @type {Array.<Object>}
   */
  var hosts = [];


  /**
   * Текущее состояние списка отелей, учитывающее примененный фильтр и сортировку.
   * Используется для отрисовки.
   * @type {Array}
   */
  var filteredHosts = [];


  /** @type {number} */
  var pageNumber = 0;


  /**
   * @param {Array.<Object>} hosts
   * @param {number} page
   */
  var renderHosts = function(hostsList, page) {
    var from = page * PAGE_SIZE;
    var to = from + PAGE_SIZE;

    var container = document.createDocumentFragment();

    hosts.slice(from, to).forEach(function(host) {
      getHostElement(host, container);
    });

    hostsContainer.appendChild(container);
  };


  /** @param {boolean} reset */
  var renderNextPages = function(reset) {
    if (reset) {
      pageNumber = 0;
      hostsContainer.innerHTML = '';
    }

    while (utils.elementIsAtTheBottom(footer) &&
          utils.nextPageIsAvailable(hosts.length, pageNumber, PAGE_SIZE)) {
      renderHosts(filteredHosts, pageNumber);
      pageNumber++;
    }
  };


  /** @param {FilterType} filterType */
  var setFilterEnabled = function(filterType) {
    filteredHosts = filter(hosts, filterType);
    renderNextPages(true);

    var activeFilter = filtersContainer.querySelector('.' + ACTIVE_FILTER_CLASSNAME);
    if (activeFilter) {
      activeFilter.classList.remove(ACTIVE_FILTER_CLASSNAME);
    }
    var filterToActivate = document.getElementById(filterType);
    filterToActivate.classList.add(ACTIVE_FILTER_CLASSNAME);
  };


  /**  Включение обработчика кликов по фильтрам */
  var setFiltrationEnabled = function() {
    filtersContainer.addEventListener('click', function(evt) {
      if (evt.target.classList.contains('host-filter') ) {
        setFilterEnabled(evt.target.id);
      }
    });

    filtersContainer.addEventListener('keydown', function(evt) {
      if (evt.target.classList.contains('host-filter') &&
          utils.isActivationEvent(event)) {
        evt.preventDefault();
        setFilterEnabled(evt.target.id);
      }
    });
  };


  /** Включение обработчика прокрутки */
  var setScrollEnabled = function() {
    window.addEventListener('scroll', utils.throttle(renderNextPages, SCROLL_TIMEOUT));
  };


  load(HOSTS_LOAD_URL, function(loadedHosts) {
    hosts = loadedHosts;

    setFiltrationEnabled();
    setFilterEnabled(DEFAULT_FILTER);
    setScrollEnabled();
  });
});
