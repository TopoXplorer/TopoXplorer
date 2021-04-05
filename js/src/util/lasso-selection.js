var d3 = require("d3");

function trackPointer(e, { start, move, out, end }) {
    const tracker = {},
      id = (tracker.id = e.pointerId),
      target = e.target;
    tracker.point = d3.pointer(e, target);
    target.setPointerCapture(id);
  
    d3.select(target)
      .on(`pointerup.${id} pointercancel.${id}`, e => {
        if (e.pointerId !== id) return;
        tracker.sourceEvent = e;
        d3.select(target).on(`.${id}`, null);
        target.releasePointerCapture(id);
        end && end(tracker);
      })
      .on(`pointermove.${id}`, e => {
        if (e.pointerId !== id) return;
        tracker.sourceEvent = e;
        tracker.prev = tracker.point;
        tracker.point = d3.pointer(e, target);
        move && move(tracker);
      })
      .on(`pointerout.${id}`, e => {
        if (e.pointerId !== id) return;
        tracker.sourceEvent = e;
        tracker.point = null;
        out && out(tracker);
      });
  
    start && start(tracker);
  }
  
function lasso() {
    const dispatch = d3.dispatch("start", "lasso", "end");
    const lasso = function(selection) {
        const node = selection.node();
        const polygon = [];
    
        selection
        .on("touchmove", e => e.preventDefault()) // prevent scrolling
        .on("pointerdown", e => {
            trackPointer(e, {
            start: p => {
                polygon.length = 0;
                dispatch.call("start", node, polygon);
            },
            move: p => {
                polygon.push(p.point);
                dispatch.call("lasso", node, polygon);
            },
            end: p => {
                dispatch.call("end", node, polygon);
            }
            });
        });
    };
    lasso.on = function(type, _) {
        return _ ? (dispatch.on(...arguments), lasso) : dispatch.on(...arguments);
    };
    
    return lasso;
}

exports.lasso = lasso;