window.addEventListener("load", () => {
  start_btn.addEventListener("click", () => start());
  retry_btn.addEventListener("click", () => to_page("start", "start"));
});

function to_page(page_name, type) {
  find_all("[page]").forEach(el => el.classList.add("hidden"));
  let page = find(`[page="${page_name}"]`);
  if(page) {
    page.classList.remove("hidden");
    document.body.setAttribute("type", type);
  }
}

const select_history = [];
const total_score = {
  一般: 0, 甜點: 0, 銀器: 0,
  精神: 0, 心情: 0, 身體: 0,
  利己: 0, 利他: 0,
  聰明: 0, 善良: 0, 寬容: 0, 誠實: 0,
  冷場: 0, 忽視: 0, 批評: 0, 虛假: 0,
};
function start() {
  clearTimeout(timeout);
  timeout = null;
  for(let key in total_score) total_score[key] = 0;
  for(let i in select_history) select_history[i] = null;
  cur_que_index = 0;
  show_que();
}


let cur_que_index = 0;
function show_que() {
  let que = que_list[cur_que_index];
  if(!que) return false;
  update_num_bar();
  find(`[page="que_card"] .que_box`).innerText = que.que;
  update_opts(que.opts);
  to_page("que_card", que.style);
  if(que.time_opt) set_timeout(que.time_opt);
  return true;
}

let timeout = null;
function set_timeout({tag, score, sec, cnt}) {
  timeout = setTimeout(() => {
    show_silence();
  }, 1e3 * sec);
  function show_silence() {
    find(`[page="que_card"] .que_box`).innerText = cnt;
    find(`[page="que_card"] .opts`).innerHTML = "";
    timeout = setTimeout(() => {
      select_opt(tag, score);
    }, 3e3);
  }
}

function update_num_bar() {
  let que_count = (que_list.length - 1).toString().padStart(2, 0);
  let cur_index = (cur_que_index).toString().padStart(2, 0);
  let str = `QUESTION ${cur_index} / ${que_count}`;
  find(`[page="que_card"] .num_bar`).innerText = str;
}

function update_opts(opts) {
  let opts_el = find(`[page="que_card"] .opts`);
  opts_el.innerHTML = "";
  opts.forEach(opt => {
    let opt_btn = new_el_to_el(opts_el, "button", opt.cnt);
    opt_btn.addEventListener("click", () => select_opt(opt.tag, opt.score));
  });
}

function select_opt(tag, score) {
  select_history[cur_que_index] = tag || null;
  for(let key in score) {
    total_score[key] += score[key];
  }
  clearTimeout(timeout);
  timeout = null;
  next_que();
}

function next_que() {
  cur_que_index++;
  let que_exist = show_que();
  if(!que_exist) show_result();
}

function show_result() {
  let result = get_result();
  to_page("result", "result");
  result_img.src = "";
  setTimeout(() => {
    result_img.src = `./result_imgs/${result}.png`;
  }, 10);
}

function get_result() {
  let max = get_max();
  let find_target = max.type + max.benefit + max.value;
  let find_results = results.filter(r_data => {
    return r_data.type + r_data.benefit + r_data.value == find_target;
  });
  if(find_results.length == 0) return results[results.length - 1].name;
  if(find_results.length == 1) return find_results[0].name;
  
  find_results.sort((r_data_a, r_data_b) => {
    let sa = get_s(r_data_a);
    let sb = get_s(r_data_b);
    return sb - sa;
  });
  return find_results[0].name;
  function get_s(r_data) {
    let s = 0;
    if(max.trait[0] == r_data.trait) s += 5;
    else if(max.trait.includes(r_data.trait)) s += 3;
    if(max.fear[0] == r_data.fear) s += 2;
    else if(max.fear.includes(r_data.fear)) s += 1;
    return s;
  }
}

function get_max() {
  let max_set = {
    type: new Set(["甜點", "銀器", "一般"]),
    benefit: new Set(["利己", "利他"]),
    value: new Set(["精神", "心情", "身體"]),
    trait: new Set(["聰明", "善良", "寬容", "誠實"]),
    fear: new Set(["冷場", "忽視", "批評", "虛假"]),
  };
  for(let key in max_set) {
    let set = max_set[key];
    let max_score = Math.max(...[...set].map(tag => total_score[tag]));
    set.forEach(tag => {
      if(total_score[tag] != max_score) set.delete(tag);
    });
  }
  let max = {};

  /* 體質 */
  if(max_set.type.size > 1) max_set.type.delete("一般");
  if(max_set.type.size > 1) {
    if(max_set.trait.has("誠實") || max_set.fear.has("虛假")) max_set.type.delete("甜點");
    else max_set.type.delete("銀器");
  }
  max.type = [...max_set.type][0];

  /* 利益 */
  if(max_set.benefit.size > 1) {
    if(select_history[3] == "利他" || select_history[8] == "利他") {
      max_set.benefit.delete("利己");
    }
    else max_set.benefit.delete("利他");
  }
  max.benefit = [...max_set.benefit][0];

  /* 看重 */
  if(max_set.value.size > 1) {
    if(max_set.value.has(select_history[7])) {
      max.value = select_history[7];
    }
    else if(max_set.value.has("精神")) max.value = "精神";
    else if(max_set.value.has("心情")) max.value = "心情";
    else max.value = "身體";
  }
  else max.value = [...max_set.value][0];

  /* 注重特質 */
  max.trait = [...max_set.trait];
  if(max.trait.includes(select_history[5]) && select_history[5]) {
    max.trait = max.trait.filter(v => v != select_history[5]);
    max.trait.unshift(select_history[5]);
  }

  /* 害怕情況 */
  max.fear = [...max_set.fear];
  if(max.fear.includes(select_history[2]) && select_history[2]) {
    max.fear = max.fear.filter(v => v != select_history[2]);
    max.fear.unshift(select_history[2]);
  }

  return max;
}
