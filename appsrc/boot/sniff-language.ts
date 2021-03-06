
import {languageSniffed} from "../actions";
import store from "../store";

if (process.type !== "renderer") {
  throw new Error("boot/sniff-language is only relevant in renderer process");
}

store.dispatch(languageSniffed(navigator.language));
