import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

/* ===== 状態 ===== */
const fly = new Set();

/* ===== UI ===== */
function openUI(p) {
  new ActionFormData()
    .title("§aWurst Lite")
    .button(`Fly [${fly.has(p.id) ? "ON" : "OFF"}]`)
    .button("Duplicate Item")
    .button("Get Troll Stick")
    .show(p).then(r => {
      if (r.canceled) return;
      if (r.selection === 0) toggleFly(p);
      if (r.selection === 1) dup(p);
      if (r.selection === 2) trollStick(p);
    });
}

/* ===== Fly ===== */
function toggleFly(p) {
  fly.has(p.id) ? fly.delete(p.id) : fly.add(p.id);
}

/* ===== Dup ===== */
function dup(p) {
  const inv = p.getComponent("minecraft:inventory").container;
  const it = inv.getItem(p.selectedSlot);
  if (it) inv.addItem(it.clone());
}

/* ===== Troll Stick ===== */
function trollStick(p) {
  const s = new ItemStack("minecraft:stick", 1);
  s.nameTag = "§cTROLL STICK";
  p.getComponent("minecraft:inventory").container.addItem(s);
}

/* ===== コマンド ===== */
world.beforeEvents.chatSend.subscribe(e => {
  if (e.message === ".wurst") {
    e.cancel = true;
    openUI(e.sender);
  }
});

/* ===== 雷 ===== */
world.beforeEvents.itemUse.subscribe(e => {
  const p = e.source;
  if (e.itemStack?.nameTag !== "§cTROLL STICK") return;
  const d = p.getViewDirection(), l = p.location;
  p.dimension.spawnEntity("minecraft:lightning_bolt", {
    x: l.x + d.x * 6,
    y: l.y + d.y * 6,
    z: l.z + d.z * 6
  });
});

/* ===== 軽量Fly処理 ===== */
system.runInterval(() => {
  for (const p of world.getPlayers()) {
    if (!fly.has(p.id)) continue;
    const v = p.getVelocity();
    let y = 0;
    if (p.isJumping) y = 0.35;
    if (p.isSneaking) y = -0.35;
    p.setVelocity({ x: v.x, y, z: v.z });
  }
}, 3);
