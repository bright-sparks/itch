
import * as React from "react";
import {connect} from "../connect";
import * as classNames from "classnames";

import Icon from "../icon";
import TaskIcon from "../task-icon";

import format from "../../util/format";
import colors from "../../constants/colors";

import * as actions from "../../actions";

import {IActionsInfo} from "./types";

import {IState} from "../../types";
import {IAction, dispatcher} from "../../constants/action-types";
import {ILocalizer} from "../../localizer";

const linearGradient = (progress: number) => {
  let percent = (progress * 100).toFixed() + "%";
  let doneColor = "#414141";
  let undoneColor = "#2B2B2B";
  return `-webkit-linear-gradient(left, ${doneColor}, ${doneColor} ` +
    `${percent}, ${undoneColor} ${percent}, ${undoneColor})`;
};

class MainAction extends React.Component<IMainActionProps, void> {
  render () {
    const {t, cancellable, platform, platformCompatible, mayDownload,
      pressDownload, canBeBought, progress, task, action, animate, halloween} = this.props;

    let child: React.ReactElement<any> = null;
    if (task) {
      child = <span className="state normal-state">
        <TaskIcon task={task} animate={animate} action={action}/>
        {this.status()}
        {cancellable
        ? <span className="cancel-cross">
          <Icon icon="cross"/>
        </span>
        : ""}
      </span>;
    } else {
      if (platformCompatible) {
        if (mayDownload) {
          child = <span className="state">
            <Icon icon="install"/>
            {t("grid.item." + (pressDownload ? "review" : "install"))}
          </span>;
        } else if (canBeBought) {
          child = <span className="state">
            <Icon icon="shopping_cart"/>
            {t("grid.item.buy_now")}
          </span>;
        }
      } else {
        return <span className="state not-platform-compatible">
          {t("grid.item.not_platform_compatible", {platform: format.itchPlatform(platform)})}
        </span>;
      }
    }

    let style: React.CSSProperties = {};
    let branded = false;
    if (progress > 0) {
      style.backgroundImage = linearGradient(progress);
      style.borderColor = "#444";
    } else if (halloween) {
      style.backgroundColor = colors.spooky;
      style.borderColor = colors.spookyLight;
    }

    const hint = this.hint();

    const buttonClasses = classNames("main-action", {
      "buy-now": (platformCompatible && !mayDownload && canBeBought),
      "hint--top": !!hint,
      branded,
    });
    const button = <div style={style} className={buttonClasses} onClick={() => this.onClick()} data-hint={hint}>
      {child}
    </div>;

    if (!child) {
      return <div/>;
    }

    return button;
  }

  hint () {
    const {t, task} = this.props;

    if (task === "error") {
      return t("grid.item.report_problem");
    }
  }

  onClick () {
    let {task, cave, game, platformCompatible, mayDownload} = this.props;
    const {navigate, queueGame, initiatePurchase, browseGame, abortGameRequest} = this.props;

    if (task === "download" || task === "find-upload") {
      navigate("downloads");
    } else {
      if (platformCompatible) {
        if (task === "launch") {
          abortGameRequest({game});
        } else if (!task || task === "idle") {
          if (mayDownload || cave) {
            queueGame({game});
          } else {
            initiatePurchase({game});
          }
        }
      } else {
        browseGame(game.id, game.url);
      }
    }
  }

  status () {
    const {t, task, action} = this.props;

    if (task === "idle") {
      switch (action) {
        case "open":
          return t("grid.item.open");
        case "launch":
        default:
          return t("grid.item.launch");
      }
    }

    if (task === "error" || task === "reporting") {
      return "";
    }

    if (task === "launch") {
      return t("grid.item.running");
    }

    let res = t("grid.item.installing");
    if (task === "uninstall") {
      res = t("grid.item.uninstalling");
    }
    if (task === "download" || task === "find-upload") {
      res = t("grid.item.downloading");
    }
    if (task === "ask-before-install") {
      res = t("grid.item.finalize_installation");
    }
    if (task === "download-queued") {
      res = t("grid.item.queued");
    }

    return res;
  }
}

interface IMainActionProps extends IActionsInfo {
  /** whether or not to animate the main action's icon (to indicate something's going on) */
  animate: boolean;
  platform: string;
  platformCompatible: boolean;
  progress: number;
  cancellable: boolean;

  pressDownload: boolean;
  halloween: boolean;

  t: ILocalizer;

  queueGame: typeof actions.queueGame;
  cancelCave: typeof actions.cancelCave;
  initiatePurchase: typeof actions.initiatePurchase;
  browseGame: typeof actions.browseGame;
  abortGameRequest: typeof actions.abortGameRequest;
  navigate: typeof actions.navigate;
}

const mapStateToProps = (state: IState) => ({
  halloween: state.status.bonuses.halloween,
});

const mapDispatchToProps = (dispatch: (action: IAction<any>) => void) => ({
  queueGame: dispatcher(dispatch, actions.queueGame),
  cancelCave: dispatcher(dispatch, actions.cancelCave),
  initiatePurchase: dispatcher(dispatch, actions.initiatePurchase),
  browseGame: dispatcher(dispatch, actions.browseGame),
  abortGameRequest: dispatcher(dispatch, actions.abortGameRequest),
  navigate: dispatcher(dispatch, actions.navigate),
});

export default connect(mapStateToProps, mapDispatchToProps)(MainAction);
