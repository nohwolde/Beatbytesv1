//---   Modules/Imports   ---//
import { Http } from "@capacitor-community/http";
import Innertube from "./innertube";
import constants from "./constants";
import rendererUtils from "./renderers";
import { Buffer } from "buffer";
import iconv from "iconv-lite";
import { Toast } from "@capacitor/toast";

let InnertubeAPI;


// add logger function
function logger(func, data, isError = false) {
  searchModule.logs.unshift({
    name: func,
    time: Date.now(),
    data: data,
    error: isError,
  });
}

const searchModule = {
  logs: new Array(),
  async autoComplete(query) {
    try {
      const response = await InnertubeAPI.getAutocompleteAsync(query);
      return response[1].map((item) => item[0]);
    } catch (err) {
      logger(constants.LOGGER_NAMES.autoComplete, err, true);
    }
  },

  async getReturnYoutubeDislike(videoId) {
    try {
      const response = await InnertubeAPI.getReturnYoutubeDislikeAsync(videoId);
      return response;
    } catch (err) {
      logger(constants.LOGGER_NAMES.getReturnYoutubeDislike, err, true);
    }
  },

  async getSponsorBlock(videoId, currentTime) {
    try {
      const response = await InnertubeAPI.getSponsorBlockAsync(videoId, currentTime);
      return response;
    } catch (err) {
      logger(constants.LOGGER_NAMES.getSponsorBlock, err, true);
    }
  },

  async search(query) {
    try {
      const response = await InnertubeAPI.getSearchAsync(query);
      return response.contents.sectionListRenderer;
    } catch (err) {
      logger(constants.LOGGER_NAMES.search, err, true);
    }
  },

  async saveApiStats(query, url) {
    await InnertubeAPI.apiStats(query, url);
  },
};

const innertubeModule = {
  async getAPI() {
    if (!InnertubeAPI) {
      InnertubeAPI = await Innertube.createAsync(
        (message, isError, shortMessage) => {
          logger(constants.LOGGER_NAMES.innertube, message, isError);
          if (shortMessage) {
            Toast.show({ text: shortMessage });
          }
        }
      );
    }
    return InnertubeAPI;
  },

  async getChannel(channelId) {
    try {
      const response = await InnertubeAPI.getChannelAsync(channelId);
      return response;
    } catch (err) {
      logger(constants.LOGGER_NAMES.getChannel, err, true);
    }
  },

  async getRecommendations(videoId) {
    try {
      const response = await InnertubeAPI.getRecommendationsAsync(videoId);
      return response;
    } catch (err) {
      logger(constants.LOGGER_NAMES.getRecommendations, err, true);
    }
  },

  async getThumbnail(videoId) {
    try {
      const response = await InnertubeAPI.getThumbnailAsync(videoId);
      return response;
    } catch (err) {
      logger(constants.LOGGER_NAMES.getThumbnail, err, true);
    }
  },

  async getVid(videoId) {
    try {
      const response = await InnertubeAPI.getVidAsync(videoId);
      return response;
    } catch (err) {
      logger(constants.LOGGER_NAMES.getVid, err, true);
    }
  },

  async searchContinuation(continuation, endpoint, contextAdditional) {
    return await InnertubeAPI.getContinuationsAsync(
      continuation,
      endpoint,
      contextAdditional
    );
  },
};

export { searchModule, innertubeModule, logger, rendererUtils };
