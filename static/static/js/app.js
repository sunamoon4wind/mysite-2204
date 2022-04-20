const g_elementDivJoinScreen = document.getElementById("div_join_screen");
const g_elementDivChatScreen = document.getElementById("div_chat_screen");
const g_elementInputUserName = document.getElementById("input_username");

const g_elementTextUserName = document.getElementById("text_username");

const g_elementInputMessage = document.getElementById("input_message");
const g_elementListMessage = document.getElementById("list_message");

// WebSocketオブジェクト
let ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
const g_socket = new WebSocket(ws_scheme + "://" + window.location.host + "/ws/chat/");

//sketch用
let num = 0;
let comments = [];
//let moveX = 0;

// 「Join」ボタンを押すと呼ばれる関数
function onsubmitButton_JoinChat() {
    // ユーザー名
    let strInputUserName = g_elementInputUserName.value;
    if (!strInputUserName) {
        return;
    }
    g_elementTextUserName.value = strInputUserName;

    // サーバーに"join"を送信
    g_socket.send(JSON.stringify({ "data_type": "join", "username": strInputUserName }));

    // 画面の切り替え
    g_elementDivJoinScreen.style.display = "none";  // 参加画面の非表示
    g_elementDivChatScreen.style.display = "block";  // チャット画面の表示
}

// 「Leave Chat.」ボタンを押すと呼ばれる関数
function onclickButton_LeaveChat() {
    // メッセージリストのクリア
    while (g_elementListMessage.firstChild) {
        g_elementListMessage.removeChild(g_elementListMessage.firstChild);
    }

    // ユーザー名
    g_elementTextUserName.value = "";

    // サーバーに"leave"を送信
    g_socket.send(JSON.stringify({ "data_type": "leave" }));

    // 画面の切り替え
    g_elementDivChatScreen.style.display = "none";  // チャット画面の非表示
    g_elementDivJoinScreen.style.display = "flex";  // 参加画面の表示
}

// 「Send」ボタンを押したときの処理
function onsubmitButton_Send() {
    // 送信用テキストHTML要素からメッセージ文字列の取得
    let strMessage = g_elementInputMessage.value;
    if (!strMessage) {
        return;
    }

    // WebSocketを通したメッセージの送信
    g_socket.send(JSON.stringify({ "message": strMessage }));

    // 送信用テキストHTML要素の中身のクリア
    g_elementInputMessage.value = "";
}

// WebSocketからメッセージ受信時の処理
g_socket.onmessage = (event) => {
    // 自身がまだ参加していないときは、無視。
    if (!g_elementTextUserName.value) {
        return;
    }

    // テキストデータをJSONデータにデコード
    let data = JSON.parse(event.data);

    // メッセージの整形
    //let strMessage = data["message"];
    let strMessage = data["datetime"] + " - [" + data["username"] + "] " + data["message"];

    // 拡散されたメッセージをメッセージリストに追加
    let elementLi = document.createElement("li");
    elementLi.textContent = strMessage;
    g_elementListMessage.prepend(elementLi); // リストの一番上に追加
    //g_elementListMessage.append( elementLi );    // リストの一番下に追加


    // comments[num] = new Danmaku(num, data["message"]);
    comments.push(new Danmaku(num, data["message"], data["username"]))
    num++;
    //comments.unshift(data["message"]);
    //moveX = 0;

    //comments[num] = new Danmaku(random(hei), num, data["message"]);
};

// WebSocketクローズ時の処理
g_socket.onclose = (event) => {
    // ウェブページを閉じたとき以外のWebSocketクローズは想定外
    console.error("Unexpected : Chat socket closed.");
};


//sketch------------------------------------------------------------------------------------------------------

let wid = document.documentElement.clientWidth;
let hei = document.documentElement.clientHeight;

function setup() {
    createCanvas(wid, hei);
    textStyle(BOLD);
}

function draw() {
    fill(0, 255, 0);
    noStroke();
    rect(0, 0, wid, hei)
    fill(0);
    if (0 < num) {
        dispDanmaku()
    }
}

function dispDanmaku() {
    for (let i = 0; i < num; i++) {
        comments[i].disp();
        comments[i].move();
    }
}

class Danmaku {
    constructor(dnum, dcomments, dname) {
        this.dy = random(50, hei - 50);
        this.dnum = dnum;
        this.dcomments = dcomments;
        textSize(30);
        this.dcomments_width = textWidth(dcomments);
        this.dname = dname;
        textSize(15);
        this.dname_width = textWidth(dname);
        this.dx = wid;

    }
    move() {
        if (this.dx > -(this.dcomments_width + this.dname_width) - 100) {
            this.dx -= 2;
        }
    }
    disp() {
        textSize(30);
        text(this.dcomments, this.dx, this.dy)
        textSize(15);
        text("(" + this.dname + ")", this.dx + this.dcomments_width + 10, this.dy)
    }
}

function windowResized() {//ウィンドウサイズの変更
    wid = document.documentElement.clientWidth;
    hei = document.documentElement.clientHeight;
    resizeCanvas(wid, hei);
}