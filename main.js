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
function set_timeout({score, sec}) {
  timeout = setTimeout(() => {
    select_opt(score);
  }, 1e3 * sec);
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
    opt_btn.addEventListener("click", () => select_opt(opt.score));
  });
}

function select_opt(score) {
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
  let target_result = [];

  /* 體質 */
  let {一般, 甜點, 銀器} = total_score;
  let max_體質 = Math.max(甜點, 銀器, 一般);
  if(甜點 == max_體質) target_result.push(...results.filter(r => r.type == "甜點"));
  if(銀器 == max_體質) target_result.push(...results.filter(r => r.type == "銀器"));
  if(一般 == max_體質) target_result.push(...results.filter(r => r.type == "一般"));

  /* 排序 */
  let max = get_max();
  let result_list = [];
  target_result.forEach(r_data => {
    let near = 0, near2 = 0;
    let tag = [];
    if(max.A.includes(r_data.A)) { near++; near2+=4; tag.push("A"); }
    if(max.B.includes(r_data.B)) { near++; near2+=3; tag.push("B"); }
    if(max.C.includes(r_data.C)) { near++; near2+=2; tag.push("C"); }
    if(max.D.includes(r_data.D)) { near++; near2+=1; tag.push("D"); }
    if(!result_list.length || result_list[0].near == near) {
      result_list.push({name: r_data.name, near, near2});
    }
    else if(result_list[0].near < near) {
      result_list = [{name: r_data.name, near, near2}];
    }
  });
  if(result_list.length == 1) return result_list[0].name;
  result_list.sort((rA, rB) => rB.near2 - rA.near2);
  return result_list[0].name;
}

function get_max() {
  let max = {
    A: ["精神", "心情", "身體"],
    B: ["利己", "利他"],
    C: ["聰明", "善良", "寬容", "誠實"],
    D: ["冷場", "忽視", "批評", "虛假"],
  };
  for(let key in max) {
    let max_score = 0;
    max[key].forEach(name => {
      max_score = Math.max(max_score, total_score[name]);
    });
    max[key] = max[key].filter(name => total_score[name] == max_score);
  }
  return max;
}
