import _throttle from 'lodash.throttle';
import axios from 'axios';

import './index.css';

/**
 * @class SortedChannelsList
 */
class SortedChannelsList {
  /**
   * @param id {string}
   */
  constructor(id) {
    this.origElem = document.getElementById(id);
    this.elem = document.createElement('ul');
    this.origElem.parentNode.insertBefore(this.elem, this.origElem);
  }

  clearList() {
    Array.from(this.elem.children).forEach(el => el.remove());
  }

  /**
   * @param sortedInfosList {Object[]}
   */
  sortBy(sortedInfosList) {
    const channelElemsList = Array.from(this.origElem.children);
    if (channelElemsList.length <= 0) return;

    const channelElemsObj = channelElemsList.reduce((obj, el) => {
      const linkElem = el.querySelector(':scope > button, :scope > a');
      if (!linkElem) return obj;
      const dataset = linkElem.dataset;
      const id = dataset.channelId || dataset.groupId || dataset.memberId;
      return Object.assign(obj, { [id]: el });
    }, {});

    this.clearList();
    sortedInfosList.forEach((info) => {
      if (!(info.id in channelElemsObj)) return;
      const elem = channelElemsObj[info.id].cloneNode(true);
      this.elem.appendChild(elem);
    });
  }
}

/** @type {Object.<string, string>} */
const API_ENDPOINT = {
  USERS_COUNTS: 'https://slack.com/api/users.counts',
};

class SortingSlackChannels {
  constructor() {
    /** @type {string} */
    this.API_TOKEN = window.boot_data.api_token;
    this.fetchChannelInfo = _throttle(this.fetchChannelInfo, 1000 * 10);
    /** @type {Object[]} */
    this.sortedChannelInfoList = [];
    this.channelListArr =
      ['starred-list', 'channel-list', 'im-list'].map(i => new SortedChannelsList(i));
    /** @type {MutationObserver} */
    this.observer = null;
  }

  start() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.observer = new MutationObserver(() => {
      this.fetchChannelInfo();
      this.sortChannels();
    });
    this.observer.observe(document.getElementById('channel-list'), {
      childList: true,
      attributes: true,
      attributeFilter: ['class'],
      subtree: true,
    });
  }

  sortChannels() {
    this.channelListArr.forEach(list => list.sortBy(this.sortedChannelInfoList));
  }

  async fetchChannelInfo() {
    const { data: info } = await axios.get(API_ENDPOINT.USERS_COUNTS, {
      params: {
        mpim_aware: true,
        only_relevant_ims: true,
        simple_unreads: true,
        include_threads: true,
        token: this.API_TOKEN,
      },
    });

    const userDMs = info.ims.map(i => Object.assign({}, i, { id: i.user_id }));

    this.sortedChannelInfoList =
      [...info.channels, ...info.groups, ...info.ims, ...userDMs]
        .sort((a, b) => b.latest - a.latest);
    this.sortChannels();
  }
}

/* ---------------------------------------------------------------------------- */

const sorting = new SortingSlackChannels();
sorting.start();
