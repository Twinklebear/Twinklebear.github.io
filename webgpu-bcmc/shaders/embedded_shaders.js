const ScanBlockSize = 512;
const SortChunkSize = 64;
const prefix_sum_comp_spv = `type RTArr = array<u32>;

type RTArr_1 = array<u32>;

struct Data {
  vals : RTArr_1,
}

struct BlockSums {
  block_sums : RTArr_1,
}

var<workgroup> chunk : array<u32, 512u>;

var<private> gl_LocalInvocationID : vec3<u32>;

@group(0) @binding(0) var<storage, read_write> x_23 : Data;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(0) @binding(1) var<storage, read_write> x_105 : BlockSums;

var<private> gl_WorkGroupID : vec3<u32>;

fn main_1() {
  var offs : u32;
  var d : i32;
  var a : u32;
  var b : u32;
  var d_1 : i32;
  var a_1 : u32;
  var b_1 : u32;
  var tmp : u32;
  let x_18 : u32 = gl_LocalInvocationID.x;
  let x_28 : u32 = gl_GlobalInvocationID.x;
  let x_32 : u32 = x_23.vals[(2u * x_28)];
  chunk[(2u * x_18)] = x_32;
  let x_36 : u32 = gl_LocalInvocationID.x;
  let x_41 : u32 = gl_GlobalInvocationID.x;
  let x_45 : u32 = x_23.vals[((2u * x_41) + 1u)];
  chunk[((2u * x_36) + 1u)] = x_45;
  offs = 1u;
  d = 256i;
  loop {
    let x_57 : i32 = d;
    if ((x_57 > 0i)) {
    } else {
      break;
    }
    workgroupBarrier();
    let x_62 : u32 = gl_LocalInvocationID.x;
    let x_63 : i32 = d;
    if ((x_62 < bitcast<u32>(x_63))) {
      let x_69 : u32 = offs;
      let x_71 : u32 = gl_LocalInvocationID.x;
      a = ((x_69 * ((2u * x_71) + 1u)) - 1u);
      let x_77 : u32 = offs;
      let x_79 : u32 = gl_LocalInvocationID.x;
      b = ((x_77 * ((2u * x_79) + 2u)) - 1u);
      let x_84 : u32 = b;
      let x_85 : u32 = a;
      let x_87 : u32 = chunk[x_85];
      let x_89 : u32 = chunk[x_84];
      chunk[x_84] = (x_89 + x_87);
    }
    let x_92 : u32 = offs;
    offs = (x_92 << bitcast<u32>(1i));

    continuing {
      let x_95 : i32 = d;
      d = (x_95 >> bitcast<u32>(1i));
    }
  }
  let x_98 : u32 = gl_LocalInvocationID.x;
  if ((x_98 == 0u)) {
    let x_108 : u32 = gl_WorkGroupID.x;
    let x_111 : u32 = chunk[511i];
    x_105.block_sums[x_108] = x_111;
    chunk[511i] = 0u;
  }
  d_1 = 1i;
  loop {
    let x_120 : i32 = d_1;
    if ((x_120 < 512i)) {
    } else {
      break;
    }
    let x_123 : u32 = offs;
    offs = (x_123 >> bitcast<u32>(1i));
    workgroupBarrier();
    let x_126 : u32 = gl_LocalInvocationID.x;
    let x_127 : i32 = d_1;
    if ((x_126 < bitcast<u32>(x_127))) {
      let x_133 : u32 = offs;
      let x_135 : u32 = gl_LocalInvocationID.x;
      a_1 = ((x_133 * ((2u * x_135) + 1u)) - 1u);
      let x_141 : u32 = offs;
      let x_143 : u32 = gl_LocalInvocationID.x;
      b_1 = ((x_141 * ((2u * x_143) + 2u)) - 1u);
      let x_149 : u32 = a_1;
      let x_151 : u32 = chunk[x_149];
      tmp = x_151;
      let x_152 : u32 = a_1;
      let x_153 : u32 = b_1;
      let x_155 : u32 = chunk[x_153];
      chunk[x_152] = x_155;
      let x_157 : u32 = b_1;
      let x_158 : u32 = tmp;
      let x_160 : u32 = chunk[x_157];
      chunk[x_157] = (x_160 + x_158);
    }

    continuing {
      let x_163 : i32 = d_1;
      d_1 = (x_163 << bitcast<u32>(1i));
    }
  }
  workgroupBarrier();
  let x_166 : u32 = gl_GlobalInvocationID.x;
  let x_169 : u32 = gl_LocalInvocationID.x;
  let x_172 : u32 = chunk[(2u * x_169)];
  x_23.vals[(2u * x_166)] = x_172;
  let x_175 : u32 = gl_GlobalInvocationID.x;
  let x_179 : u32 = gl_LocalInvocationID.x;
  let x_183 : u32 = chunk[((2u * x_179) + 1u)];
  x_23.vals[((2u * x_175) + 1u)] = x_183;
  return;
}

@compute @workgroup_size(256i, 1i, 1i)
fn main(@builtin(local_invocation_id) gl_LocalInvocationID_param : vec3<u32>, @builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>, @builtin(workgroup_id) gl_WorkGroupID_param : vec3<u32>) {
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  gl_WorkGroupID = gl_WorkGroupID_param;
  main_1();
}
`;

const block_prefix_sum_comp_spv = `type RTArr = array<u32>;

struct Data {
  vals : RTArr,
}

struct CarryInOut {
  carry_in : u32,
  carry_out : u32,
}

var<workgroup> chunk : array<u32, 512u>;

var<private> gl_LocalInvocationID : vec3<u32>;

@group(0) @binding(0) var<storage, read_write> x_23 : Data;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(0) @binding(1) var<storage, read_write> x_104 : CarryInOut;

fn main_1() {
  var offs : u32;
  var d : i32;
  var a : u32;
  var b : u32;
  var d_1 : i32;
  var a_1 : u32;
  var b_1 : u32;
  var tmp : u32;
  let x_18 : u32 = gl_LocalInvocationID.x;
  let x_28 : u32 = gl_GlobalInvocationID.x;
  let x_32 : u32 = x_23.vals[(2u * x_28)];
  chunk[(2u * x_18)] = x_32;
  let x_36 : u32 = gl_LocalInvocationID.x;
  let x_41 : u32 = gl_GlobalInvocationID.x;
  let x_45 : u32 = x_23.vals[((2u * x_41) + 1u)];
  chunk[((2u * x_36) + 1u)] = x_45;
  offs = 1u;
  d = 256i;
  loop {
    let x_57 : i32 = d;
    if ((x_57 > 0i)) {
    } else {
      break;
    }
    workgroupBarrier();
    let x_62 : u32 = gl_LocalInvocationID.x;
    let x_63 : i32 = d;
    if ((x_62 < bitcast<u32>(x_63))) {
      let x_69 : u32 = offs;
      let x_71 : u32 = gl_LocalInvocationID.x;
      a = ((x_69 * ((2u * x_71) + 1u)) - 1u);
      let x_77 : u32 = offs;
      let x_79 : u32 = gl_LocalInvocationID.x;
      b = ((x_77 * ((2u * x_79) + 2u)) - 1u);
      let x_84 : u32 = b;
      let x_85 : u32 = a;
      let x_87 : u32 = chunk[x_85];
      let x_89 : u32 = chunk[x_84];
      chunk[x_84] = (x_89 + x_87);
    }
    let x_92 : u32 = offs;
    offs = (x_92 << bitcast<u32>(1i));

    continuing {
      let x_95 : i32 = d;
      d = (x_95 >> bitcast<u32>(1i));
    }
  }
  let x_98 : u32 = gl_LocalInvocationID.x;
  if ((x_98 == 0u)) {
    let x_107 : u32 = chunk[511i];
    let x_109 : u32 = x_104.carry_in;
    x_104.carry_out = (x_107 + x_109);
    chunk[511i] = 0u;
  }
  d_1 = 1i;
  loop {
    let x_119 : i32 = d_1;
    if ((x_119 < 512i)) {
    } else {
      break;
    }
    let x_122 : u32 = offs;
    offs = (x_122 >> bitcast<u32>(1i));
    workgroupBarrier();
    let x_125 : u32 = gl_LocalInvocationID.x;
    let x_126 : i32 = d_1;
    if ((x_125 < bitcast<u32>(x_126))) {
      let x_132 : u32 = offs;
      let x_134 : u32 = gl_LocalInvocationID.x;
      a_1 = ((x_132 * ((2u * x_134) + 1u)) - 1u);
      let x_140 : u32 = offs;
      let x_142 : u32 = gl_LocalInvocationID.x;
      b_1 = ((x_140 * ((2u * x_142) + 2u)) - 1u);
      let x_148 : u32 = a_1;
      let x_150 : u32 = chunk[x_148];
      tmp = x_150;
      let x_151 : u32 = a_1;
      let x_152 : u32 = b_1;
      let x_154 : u32 = chunk[x_152];
      chunk[x_151] = x_154;
      let x_156 : u32 = b_1;
      let x_157 : u32 = tmp;
      let x_159 : u32 = chunk[x_156];
      chunk[x_156] = (x_159 + x_157);
    }

    continuing {
      let x_162 : i32 = d_1;
      d_1 = (x_162 << bitcast<u32>(1i));
    }
  }
  workgroupBarrier();
  let x_165 : u32 = gl_GlobalInvocationID.x;
  let x_168 : u32 = gl_LocalInvocationID.x;
  let x_171 : u32 = chunk[(2u * x_168)];
  let x_173 : u32 = x_104.carry_in;
  x_23.vals[(2u * x_165)] = (x_171 + x_173);
  let x_177 : u32 = gl_GlobalInvocationID.x;
  let x_181 : u32 = gl_LocalInvocationID.x;
  let x_185 : u32 = chunk[((2u * x_181) + 1u)];
  let x_187 : u32 = x_104.carry_in;
  x_23.vals[((2u * x_177) + 1u)] = (x_185 + x_187);
  return;
}

@compute @workgroup_size(256i, 1i, 1i)
fn main(@builtin(local_invocation_id) gl_LocalInvocationID_param : vec3<u32>, @builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const add_block_sums_comp_spv = `type RTArr = array<u32>;

type RTArr_1 = array<u32>;

struct BlockSums {
  block_sums : RTArr_1,
}

struct Data {
  vals : RTArr_1,
}

@group(0) @binding(1) var<storage, read_write> x_12 : BlockSums;

var<private> gl_WorkGroupID : vec3<u32>;

@group(0) @binding(0) var<storage, read_write> x_28 : Data;

var<private> gl_GlobalInvocationID : vec3<u32>;

fn main_1() {
  var prev_sum : u32;
  let x_21 : u32 = gl_WorkGroupID.x;
  let x_24 : u32 = x_12.block_sums[x_21];
  prev_sum = x_24;
  let x_32 : u32 = gl_GlobalInvocationID.x;
  let x_33 : u32 = (2u * x_32);
  let x_34 : u32 = prev_sum;
  let x_36 : u32 = x_28.vals[x_33];
  x_28.vals[x_33] = (x_36 + x_34);
  let x_40 : u32 = gl_GlobalInvocationID.x;
  let x_43 : u32 = ((2u * x_40) + 1u);
  let x_44 : u32 = prev_sum;
  let x_46 : u32 = x_28.vals[x_43];
  x_28.vals[x_43] = (x_46 + x_44);
  return;
}

@compute @workgroup_size(256i, 1i, 1i)
fn main(@builtin(workgroup_id) gl_WorkGroupID_param : vec3<u32>, @builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_WorkGroupID = gl_WorkGroupID_param;
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const stream_compact_comp_spv = `type RTArr = array<u32>;

type RTArr_1 = array<u32>;

struct Input {
  inputs : RTArr_1,
}

type RTArr_2 = array<u32>;

struct Output {
  outputs : RTArr_1,
}

struct Offsets {
  offsets : RTArr_1,
}

struct CompactionOffset {
  compact_offset : u32,
}

@group(0) @binding(0) var<storage, read_write> x_10 : Input;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(0) @binding(3) var<storage, read_write> x_30 : Output;

@group(0) @binding(1) var<storage, read_write> x_34 : Offsets;

@group(0) @binding(2) var<uniform> x_43 : CompactionOffset;

fn main_1() {
  let x_19 : u32 = gl_GlobalInvocationID.x;
  let x_22 : u32 = x_10.inputs[x_19];
  if ((x_22 != 0u)) {
    let x_36 : u32 = gl_GlobalInvocationID.x;
    let x_38 : u32 = x_34.offsets[x_36];
    let x_40 : u32 = gl_GlobalInvocationID.x;
    let x_45 : u32 = x_43.compact_offset;
    x_30.outputs[x_38] = (x_40 + x_45);
  }
  return;
}

@compute @workgroup_size(1i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const mc_isosurface_vert_spv = `struct VolumeParams {
  volume_dims : vec4<u32>,
  padded_dims : vec4<u32>,
  volume_scale : vec4<f32>,
  max_bits : u32,
  isovalue : f32,
}

struct ViewParams {
  proj_view : mat4x4<f32>,
  eye_pos : vec4<f32>,
}

@group(0) @binding(1) var<uniform> x_56 : VolumeParams;

var<private> pos : vec2<u32>;

var<private> world_pos : vec4<f32>;

@group(0) @binding(0) var<uniform> x_144 : ViewParams;

var<private> gl_Position : vec4<f32>;

fn block_id_to_pos_u1_(id : ptr<function, u32>) -> vec3<u32> {
  var n_blocks : vec3<u32>;
  let x_60 : vec4<u32> = x_56.padded_dims;
  n_blocks = (vec3<u32>(x_60.x, x_60.y, x_60.z) / vec3<u32>(4u, 4u, 4u));
  let x_65 : u32 = *(id);
  let x_68 : u32 = n_blocks.x;
  let x_70 : u32 = *(id);
  let x_72 : u32 = n_blocks.x;
  let x_76 : u32 = n_blocks.y;
  let x_78 : u32 = *(id);
  let x_80 : u32 = n_blocks.x;
  let x_82 : u32 = n_blocks.y;
  return vec3<u32>((x_65 % x_68), ((x_70 / x_72) % x_76), (x_78 / (x_80 * x_82)));
}

fn decompress_position_u1_(compressed : ptr<function, u32>) -> vec3<f32> {
  var quantized : vec3<f32>;
  let x_21 : u32 = *(compressed);
  let x_28 : u32 = *(compressed);
  let x_34 : u32 = *(compressed);
  quantized = vec3<f32>(f32(((x_21 & 1072693248u) >> bitcast<u32>(20i))), f32(((x_28 & 1047552u) >> bitcast<u32>(10i))), f32((x_34 & 1023u)));
  let x_39 : vec3<f32> = quantized;
  return (((x_39 * 4.0f) / vec3<f32>(1023.0f, 1023.0f, 1023.0f)) + vec3<f32>(0.5f, 0.5f, 0.5f));
}

fn main_1() {
  var block_pos : vec3<f32>;
  var param : u32;
  var param_1 : u32;
  let x_94 : u32 = pos.y;
  param = x_94;
  let x_96 : vec3<u32> = block_id_to_pos_u1_(&(param));
  block_pos = (vec3<f32>(x_96) * 4.0f);
  let x_101 : vec3<f32> = block_pos;
  let x_104 : u32 = pos.x;
  param_1 = x_104;
  let x_105 : vec3<f32> = decompress_position_u1_(&(param_1));
  let x_106 : vec3<f32> = (x_101 + x_105);
  world_pos.x = x_106.x;
  world_pos.y = x_106.y;
  world_pos.z = x_106.z;
  let x_118 : vec4<f32> = x_56.volume_scale;
  let x_120 : vec4<f32> = world_pos;
  let x_124 : vec4<u32> = x_56.volume_dims;
  let x_130 : vec3<f32> = (vec3<f32>(x_118.x, x_118.y, x_118.z) * ((vec3<f32>(x_120.x, x_120.y, x_120.z) / vec3<f32>(vec3<u32>(x_124.x, x_124.y, x_124.z))) - vec3<f32>(0.5f, 0.5f, 0.5f)));
  world_pos.x = x_130.x;
  world_pos.y = x_130.y;
  world_pos.z = x_130.z;
  let x_147 : mat4x4<f32> = x_144.proj_view;
  let x_148 : vec4<f32> = world_pos;
  let x_149 : vec3<f32> = vec3<f32>(x_148.x, x_148.y, x_148.z);
  gl_Position = (x_147 * vec4<f32>(x_149.x, x_149.y, x_149.z, 1.0f));
  return;
}

struct main_out {
  @location(0)
  world_pos_1 : vec4<f32>,
  @builtin(position)
  gl_Position : vec4<f32>,
}

@vertex
fn main(@location(0) @interpolate(flat) pos_param : vec2<u32>) -> main_out {
  pos = pos_param;
  main_1();
  return main_out(world_pos, gl_Position);
}
`;

const mc_isosurface_frag_spv = `struct ViewParams {
  proj_view : mat4x4<f32>,
  eye_pos : vec4<f32>,
}

var<private> world_pos : vec4<f32>;

@group(0) @binding(0) var<uniform> x_18 : ViewParams;

var<private> color : vec4<f32>;

fn main_1() {
  var v : vec3<f32>;
  var dist : f32;
  var light_dir : vec3<f32>;
  var n : vec3<f32>;
  var base_color : vec3<f32>;
  var h : vec3<f32>;
  let x_13 : vec4<f32> = world_pos;
  let x_23 : vec4<f32> = x_18.eye_pos;
  v = (vec3<f32>(x_13.x, x_13.y, x_13.z) - vec3<f32>(x_23.x, x_23.y, x_23.z));
  let x_28 : vec3<f32> = v;
  dist = length(x_28);
  let x_30 : vec3<f32> = v;
  v = -(normalize(x_30));
  let x_34 : vec3<f32> = v;
  light_dir = x_34;
  let x_36 : vec4<f32> = world_pos;
  let x_39 : vec4<f32> = world_pos;
  n = normalize(cross(dpdx(vec3<f32>(x_36.x, x_36.y, x_36.z)), dpdy(vec3<f32>(x_39.x, x_39.y, x_39.z))));
  let x_44 : vec3<f32> = n;
  let x_45 : vec3<f32> = light_dir;
  if ((dot(x_44, x_45) < 0.0f)) {
    let x_52 : vec3<f32> = n;
    n = -(x_52);
  }
  base_color = vec3<f32>(0.300000012f, 0.300000012f, 0.899999976f);
  let x_59 : vec3<f32> = v;
  let x_60 : vec3<f32> = light_dir;
  h = normalize((x_59 + x_60));
  let x_65 : vec3<f32> = base_color;
  let x_67 : vec3<f32> = (x_65 * 0.200000003f);
  color.x = x_67.x;
  color.y = x_67.y;
  color.z = x_67.z;
  let x_80 : vec3<f32> = light_dir;
  let x_81 : vec3<f32> = n;
  let x_86 : vec3<f32> = base_color;
  let x_88 : vec4<f32> = color;
  let x_90 : vec3<f32> = (vec3<f32>(x_88.x, x_88.y, x_88.z) + (x_86 * (0.600000024f * clamp(dot(x_80, x_81), 0.0f, 1.0f))));
  color.x = x_90.x;
  color.y = x_90.y;
  color.z = x_90.z;
  let x_98 : vec3<f32> = n;
  let x_99 : vec3<f32> = h;
  let x_104 : f32 = (0.100000001f * pow(clamp(dot(x_98, x_99), 0.0f, 1.0f), 5.0f));
  let x_105 : vec4<f32> = color;
  let x_108 : vec3<f32> = (vec3<f32>(x_105.x, x_105.y, x_105.z) + vec3<f32>(x_104, x_104, x_104));
  color.x = x_108.x;
  color.y = x_108.y;
  color.z = x_108.z;
  color.w = 1.0f;
  return;
}

struct main_out {
  @location(0)
  color_1 : vec4<f32>,
}

@fragment
fn main(@location(0) world_pos_param : vec4<f32>) -> main_out {
  world_pos = world_pos_param;
  main_1();
  return main_out(color);
}
`;

const zfp_compute_block_range_comp_spv = `struct EmulateUint64 {
  lo : u32,
  hi : u32,
}

struct BlockReader {
  current_bit : u32,
  current_word : u32,
  word_buffer : EmulateUint64,
}

struct VolumeParams {
  volume_dims : vec4<u32>,
  padded_dims : vec4<u32>,
  volume_scale : vec4<f32>,
  max_bits : u32,
  isovalue : f32,
}

struct EmulateUint64_1 {
  lo : u32,
  hi : u32,
}

type RTArr = array<EmulateUint64_1>;

struct Compressed {
  compressed : RTArr,
}

struct BlockIDOffset {
  block_id_offset : u32,
}

type RTArr_1 = array<vec2<f32>>;

struct BlockRanges {
  block_ranges : RTArr_1,
}

@group(0) @binding(1) var<uniform> x_242 : VolumeParams;

@group(0) @binding(0) var<storage, read_write> x_261 : Compressed;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(1) @binding(0) var<uniform> x_863 : BlockIDOffset;

@group(0) @binding(2) var<storage, read_write> x_1064 : BlockRanges;

fn shift_right_struct_EmulateUint64_u1_u11_u1_(a_3 : EmulateUint64, n_1 : ptr<function, u32>) -> EmulateUint64 {
  var carry_1 : u32;
  var b_3 : EmulateUint64;
  let x_167 : u32 = *(n_1);
  if ((x_167 == 0u)) {
    return a_3;
  }
  let x_172 : u32 = *(n_1);
  if ((x_172 < 32u)) {
    let x_178 : u32 = *(n_1);
    carry_1 = (a_3.hi & (4294967295u >> (32u - x_178)));
    let x_184 : u32 = *(n_1);
    let x_186 : u32 = carry_1;
    let x_187 : u32 = *(n_1);
    b_3.lo = ((a_3.lo >> x_184) | (x_186 << (32u - x_187)));
    let x_193 : u32 = *(n_1);
    b_3.hi = (a_3.hi >> x_193);
  } else {
    let x_198 : u32 = *(n_1);
    b_3.lo = (a_3.hi >> (x_198 - 32u));
    b_3.hi = 0u;
  }
  let x_203 : EmulateUint64 = b_3;
  return x_203;
}

fn create_block_reader_u1_(block_index : ptr<function, u32>) -> BlockReader {
  var reader_5 : BlockReader;
  var param_2 : u32;
  let x_237 : u32 = *(block_index);
  let x_246 : u32 = x_242.max_bits;
  reader_5.current_word = ((x_237 * x_246) / 64u);
  let x_250 : u32 = *(block_index);
  let x_252 : u32 = x_242.max_bits;
  reader_5.current_bit = ((x_250 * x_252) % 64u);
  let x_263 : u32 = reader_5.current_word;
  let x_266 : EmulateUint64_1 = x_261.compressed[x_263];
  reader_5.word_buffer.lo = x_266.lo;
  reader_5.word_buffer.hi = x_266.hi;
  let x_273 : EmulateUint64 = reader_5.word_buffer;
  let x_276 : u32 = reader_5.current_bit;
  param_2 = x_276;
  let x_277 : EmulateUint64 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_273, &(param_2));
  reader_5.word_buffer = x_277;
  let x_279 : BlockReader = reader_5;
  return x_279;
}

fn advance_word_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(reader : ptr<function, BlockReader>) {
  (*(reader)).current_bit = 0u;
  let x_284 : u32 = (*(reader)).current_word;
  (*(reader)).current_word = (x_284 + bitcast<u32>(1i));
  let x_287 : u32 = (*(reader)).current_word;
  let x_289 : EmulateUint64_1 = x_261.compressed[x_287];
  (*(reader)).word_buffer.lo = x_289.lo;
  (*(reader)).word_buffer.hi = x_289.hi;
  return;
}

fn read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(reader_1 : ptr<function, BlockReader>) -> u32 {
  var bit : u32;
  var param_3 : u32;
  var param_4 : BlockReader;
  let x_297 : u32 = (*(reader_1)).word_buffer.lo;
  bit = (x_297 & 1u);
  let x_301 : u32 = (*(reader_1)).current_bit;
  (*(reader_1)).current_bit = (x_301 + bitcast<u32>(1i));
  let x_304 : EmulateUint64 = (*(reader_1)).word_buffer;
  param_3 = 1u;
  let x_306 : EmulateUint64 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_304, &(param_3));
  (*(reader_1)).word_buffer = x_306;
  let x_309 : u32 = (*(reader_1)).current_bit;
  if ((x_309 >= 64u)) {
    let x_314 : BlockReader = *(reader_1);
    param_4 = x_314;
    advance_word_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_4));
    let x_316 : BlockReader = param_4;
    *(reader_1) = x_316;
  }
  let x_317 : u32 = bit;
  return x_317;
}

fn make_emulate_uint64_u1_u1_(hi : ptr<function, u32>, lo : ptr<function, u32>) -> EmulateUint64 {
  var a_4 : EmulateUint64;
  let x_92 : u32 = *(lo);
  a_4.lo = x_92;
  let x_95 : u32 = *(hi);
  a_4.hi = x_95;
  let x_97 : EmulateUint64 = a_4;
  return x_97;
}

fn make_mask_u1_(n_2 : ptr<function, u32>) -> EmulateUint64 {
  var a_5 : EmulateUint64;
  var param : u32;
  var param_1 : u32;
  param = 0u;
  param_1 = 0u;
  let x_209 : EmulateUint64 = make_emulate_uint64_u1_u1_(&(param), &(param_1));
  a_5 = x_209;
  let x_210 : u32 = *(n_2);
  let x_212 : u32 = *(n_2);
  if (((x_210 > 0u) & (x_212 < 65u))) {
    let x_218 : u32 = *(n_2);
    if ((x_218 > 32u)) {
      a_5.lo = 4294967295u;
      let x_223 : u32 = *(n_2);
      a_5.hi = (4294967295u >> (64u - x_223));
    } else {
      let x_228 : u32 = *(n_2);
      a_5.lo = (4294967295u >> (32u - x_228));
      a_5.hi = 0u;
    }
  }
  let x_233 : EmulateUint64 = a_5;
  return x_233;
}

fn bitwise_and_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(a : EmulateUint64, b : EmulateUint64) -> EmulateUint64 {
  var c : EmulateUint64;
  c.lo = (a.lo & b.lo);
  c.hi = (a.hi & b.hi);
  let x_109 : EmulateUint64 = c;
  return x_109;
}

fn shift_left_struct_EmulateUint64_u1_u11_u1_(a_2 : EmulateUint64, n : ptr<function, u32>) -> EmulateUint64 {
  var carry : u32;
  var b_2 : EmulateUint64;
  let x_124 : u32 = *(n);
  if ((x_124 == 0u)) {
    return a_2;
  }
  let x_131 : u32 = *(n);
  if ((x_131 < 32u)) {
    let x_139 : u32 = *(n);
    carry = (a_2.lo & (4294967295u << (32u - x_139)));
    let x_145 : u32 = *(n);
    b_2.lo = (a_2.lo << x_145);
    let x_149 : u32 = *(n);
    let x_151 : u32 = carry;
    let x_152 : u32 = *(n);
    b_2.hi = ((a_2.hi << x_149) | (x_151 >> (32u - x_152)));
  } else {
    b_2.lo = 0u;
    let x_160 : u32 = *(n);
    b_2.hi = (a_2.lo << (x_160 - 32u));
  }
  let x_164 : EmulateUint64 = b_2;
  return x_164;
}

fn bitwise_or_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(a_1 : EmulateUint64, b_1 : EmulateUint64) -> EmulateUint64 {
  var c_1 : EmulateUint64;
  c_1.lo = (a_1.lo | b_1.lo);
  c_1.hi = (a_1.hi | b_1.hi);
  let x_121 : EmulateUint64 = c_1;
  return x_121;
}

fn read_bits_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_(reader_2 : ptr<function, BlockReader>, n_bits : u32) -> EmulateUint64 {
  var rem_bits : u32;
  var first_read : u32;
  var mask : EmulateUint64;
  var param_5 : u32;
  var bits : EmulateUint64;
  var param_6 : u32;
  var next_read : u32;
  var param_7 : BlockReader;
  var param_8 : u32;
  var param_9 : u32;
  var param_10 : u32;
  let x_322 : u32 = (*(reader_2)).current_bit;
  rem_bits = (64u - x_322);
  let x_325 : u32 = rem_bits;
  first_read = min(x_325, n_bits);
  let x_329 : u32 = first_read;
  param_5 = x_329;
  let x_330 : EmulateUint64 = make_mask_u1_(&(param_5));
  mask = x_330;
  let x_333 : EmulateUint64 = (*(reader_2)).word_buffer;
  let x_334 : EmulateUint64 = mask;
  let x_335 : EmulateUint64 = bitwise_and_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_333, x_334);
  bits = x_335;
  let x_337 : EmulateUint64 = (*(reader_2)).word_buffer;
  param_6 = n_bits;
  let x_339 : EmulateUint64 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_337, &(param_6));
  (*(reader_2)).word_buffer = x_339;
  let x_341 : u32 = first_read;
  let x_343 : u32 = (*(reader_2)).current_bit;
  (*(reader_2)).current_bit = (x_343 + x_341);
  next_read = 0u;
  let x_347 : u32 = rem_bits;
  if ((n_bits >= x_347)) {
    let x_352 : BlockReader = *(reader_2);
    param_7 = x_352;
    advance_word_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_7));
    let x_354 : BlockReader = param_7;
    *(reader_2) = x_354;
    let x_355 : u32 = first_read;
    next_read = (n_bits - x_355);
  }
  let x_358 : u32 = next_read;
  param_8 = x_358;
  let x_359 : EmulateUint64 = make_mask_u1_(&(param_8));
  mask = x_359;
  let x_360 : EmulateUint64 = bits;
  let x_362 : EmulateUint64 = (*(reader_2)).word_buffer;
  let x_363 : EmulateUint64 = mask;
  let x_364 : EmulateUint64 = bitwise_and_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_362, x_363);
  let x_366 : u32 = first_read;
  param_9 = x_366;
  let x_367 : EmulateUint64 = shift_left_struct_EmulateUint64_u1_u11_u1_(x_364, &(param_9));
  let x_368 : EmulateUint64 = bitwise_or_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_360, x_367);
  bits = x_368;
  let x_370 : EmulateUint64 = (*(reader_2)).word_buffer;
  let x_372 : u32 = next_read;
  param_10 = x_372;
  let x_373 : EmulateUint64 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_370, &(param_10));
  (*(reader_2)).word_buffer = x_373;
  let x_375 : u32 = next_read;
  let x_377 : u32 = (*(reader_2)).current_bit;
  (*(reader_2)).current_bit = (x_377 + x_375);
  let x_380 : EmulateUint64 = bits;
  return x_380;
}

fn decode_ints_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_u1_64__(reader_3 : ptr<function, BlockReader>, block_max_bits : u32, block_1 : ptr<function, array<u32, 64u>>) {
  var i : u32;
  var x_1 : EmulateUint64;
  var param_11 : u32;
  var param_12 : u32;
  var one : EmulateUint64;
  var param_13 : u32;
  var param_14 : u32;
  var bits_1 : u32;
  var k : u32;
  var n_3 : u32;
  var m : u32;
  var param_15 : BlockReader;
  var param_16 : BlockReader;
  var param_17 : BlockReader;
  var param_18 : u32;
  var i_1 : u32;
  var param_19 : u32;
  i = 0u;
  loop {
    let x_396 : u32 = i;
    if ((x_396 < 64u)) {
    } else {
      break;
    }
    let x_398 : u32 = i;
    (*(block_1))[x_398] = 0u;

    continuing {
      let x_400 : u32 = i;
      i = (x_400 + bitcast<u32>(1i));
    }
  }
  param_11 = 0u;
  param_12 = 0u;
  let x_405 : EmulateUint64 = make_emulate_uint64_u1_u1_(&(param_11), &(param_12));
  x_1 = x_405;
  param_13 = 0u;
  param_14 = 1u;
  let x_409 : EmulateUint64 = make_emulate_uint64_u1_u1_(&(param_13), &(param_14));
  one = x_409;
  bits_1 = block_max_bits;
  k = 32u;
  n_3 = 0u;
  loop {
    var x_424 : bool;
    var x_425 : bool;
    let x_418 : u32 = bits_1;
    let x_419 : bool = (x_418 != 0u);
    x_425 = x_419;
    if (x_419) {
      let x_422 : u32 = k;
      k = (x_422 - bitcast<u32>(1i));
      x_424 = (x_422 > 0u);
      x_425 = x_424;
    }
    if (x_425) {
    } else {
      break;
    }
    let x_427 : u32 = n_3;
    let x_428 : u32 = bits_1;
    m = min(x_427, x_428);
    let x_430 : u32 = m;
    let x_431 : u32 = bits_1;
    bits_1 = (x_431 - x_430);
    let x_433 : u32 = m;
    let x_435 : BlockReader = *(reader_3);
    param_15 = x_435;
    let x_436 : EmulateUint64 = read_bits_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_(&(param_15), x_433);
    let x_437 : BlockReader = param_15;
    *(reader_3) = x_437;
    x_1 = x_436;
    loop {
      var x_456 : bool;
      var x_457 : bool;
      let x_443 : u32 = n_3;
      let x_445 : u32 = bits_1;
      let x_447 : bool = ((x_443 < 64u) & (x_445 != 0u));
      x_457 = x_447;
      if (x_447) {
        let x_450 : u32 = bits_1;
        bits_1 = (x_450 - bitcast<u32>(1i));
        let x_453 : BlockReader = *(reader_3);
        param_16 = x_453;
        let x_454 : u32 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_16));
        let x_455 : BlockReader = param_16;
        *(reader_3) = x_455;
        x_456 = (x_454 != 0u);
        x_457 = x_456;
      }
      if (x_457) {
      } else {
        break;
      }
      loop {
        var x_477 : bool;
        var x_478 : bool;
        let x_463 : u32 = n_3;
        let x_466 : u32 = bits_1;
        let x_468 : bool = ((x_463 < 63u) & (x_466 != 0u));
        x_478 = x_468;
        if (x_468) {
          let x_471 : u32 = bits_1;
          bits_1 = (x_471 - bitcast<u32>(1i));
          let x_474 : BlockReader = *(reader_3);
          param_17 = x_474;
          let x_475 : u32 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_17));
          let x_476 : BlockReader = param_17;
          *(reader_3) = x_476;
          x_477 = (x_475 == 0u);
          x_478 = x_477;
        }
        if (x_478) {
        } else {
          break;
        }

        continuing {
          let x_479 : u32 = n_3;
          n_3 = (x_479 + bitcast<u32>(1i));
        }
      }

      continuing {
        let x_481 : EmulateUint64 = x_1;
        let x_482 : EmulateUint64 = one;
        let x_483 : u32 = n_3;
        n_3 = (x_483 + bitcast<u32>(1i));
        param_18 = x_483;
        let x_486 : EmulateUint64 = shift_left_struct_EmulateUint64_u1_u11_u1_(x_482, &(param_18));
        let x_487 : EmulateUint64 = bitwise_or_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_481, x_486);
        x_1 = x_487;
      }
    }
    i_1 = 0u;
    loop {
      let x_494 : u32 = i_1;
      if ((x_494 < 64u)) {
      } else {
        break;
      }
      let x_496 : u32 = i_1;
      let x_498 : u32 = x_1.lo;
      let x_500 : u32 = k;
      let x_503 : u32 = (*(block_1))[x_496];
      (*(block_1))[x_496] = (x_503 + ((x_498 & 1u) << x_500));

      continuing {
        let x_506 : u32 = i_1;
        i_1 = (x_506 + bitcast<u32>(1i));
        let x_508 : EmulateUint64 = x_1;
        param_19 = 1u;
        let x_510 : EmulateUint64 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_508, &(param_19));
        x_1 = x_510;
      }
    }
  }
  return;
}

fn uint2int_u1_(x : ptr<function, u32>) -> i32 {
  let x_383 : u32 = *(x);
  return bitcast<i32>(((x_383 ^ 2863311530u) - 2863311530u));
}

fn inverse_lift_i1_64__u1_u1_(block_2 : ptr<function, array<i32, 64u>>, s : u32, idx : u32) {
  var i_2 : u32;
  var v : vec4<i32>;
  var i_3 : u32;
  i_2 = 0u;
  loop {
    let x_517 : u32 = i_2;
    if ((x_517 < 4u)) {
    } else {
      break;
    }
    let x_523 : u32 = i_2;
    let x_524 : u32 = i_2;
    let x_529 : i32 = (*(block_2))[(idx + (x_524 * s))];
    v[x_523] = x_529;

    continuing {
      let x_531 : u32 = i_2;
      i_2 = (x_531 + bitcast<u32>(1i));
    }
  }
  let x_535 : i32 = v.w;
  let x_538 : i32 = v.y;
  v.y = (x_538 + (x_535 >> bitcast<u32>(1i)));
  let x_542 : i32 = v.y;
  let x_545 : i32 = v.w;
  v.w = (x_545 - (x_542 >> bitcast<u32>(1i)));
  let x_549 : i32 = v.w;
  let x_551 : i32 = v.y;
  v.y = (x_551 + x_549);
  let x_555 : i32 = v.w;
  v.w = (x_555 << bitcast<u32>(1i));
  let x_559 : i32 = v.y;
  let x_561 : i32 = v.w;
  v.w = (x_561 - x_559);
  let x_565 : i32 = v.x;
  let x_568 : i32 = v.z;
  v.z = (x_568 + x_565);
  let x_572 : i32 = v.x;
  v.x = (x_572 << bitcast<u32>(1i));
  let x_576 : i32 = v.z;
  let x_578 : i32 = v.x;
  v.x = (x_578 - x_576);
  let x_582 : i32 = v.z;
  let x_584 : i32 = v.y;
  v.y = (x_584 + x_582);
  let x_588 : i32 = v.z;
  v.z = (x_588 << bitcast<u32>(1i));
  let x_592 : i32 = v.y;
  let x_594 : i32 = v.z;
  v.z = (x_594 - x_592);
  let x_598 : i32 = v.x;
  let x_600 : i32 = v.w;
  v.w = (x_600 + x_598);
  let x_604 : i32 = v.x;
  v.x = (x_604 << bitcast<u32>(1i));
  let x_608 : i32 = v.w;
  let x_610 : i32 = v.x;
  v.x = (x_610 - x_608);
  i_3 = 0u;
  loop {
    let x_619 : u32 = i_3;
    if ((x_619 < 4u)) {
    } else {
      break;
    }
    let x_621 : u32 = i_3;
    let x_624 : u32 = i_3;
    let x_626 : i32 = v[x_624];
    (*(block_2))[(idx + (x_621 * s))] = x_626;

    continuing {
      let x_628 : u32 = i_3;
      i_3 = (x_628 + bitcast<u32>(1i));
    }
  }
  return;
}

fn inverse_transform_i1_64__(block_3 : ptr<function, array<i32, 64u>>) {
  var y : u32;
  var x_2 : u32;
  var param_20 : array<i32, 64u>;
  var x_3 : u32;
  var z : u32;
  var param_21 : array<i32, 64u>;
  var z_1 : u32;
  var y_1 : u32;
  var param_22 : array<i32, 64u>;
  y = 0u;
  loop {
    let x_636 : u32 = y;
    if ((x_636 < 4u)) {
    } else {
      break;
    }
    x_2 = 0u;
    loop {
      let x_644 : u32 = x_2;
      if ((x_644 < 4u)) {
      } else {
        break;
      }
      let x_647 : u32 = x_2;
      let x_648 : u32 = y;
      let x_652 : array<i32, 64u> = *(block_3);
      param_20 = x_652;
      inverse_lift_i1_64__u1_u1_(&(param_20), 16u, (x_647 + (4u * x_648)));
      let x_654 : array<i32, 64u> = param_20;
      *(block_3) = x_654;

      continuing {
        let x_655 : u32 = x_2;
        x_2 = (x_655 + bitcast<u32>(1i));
      }
    }

    continuing {
      let x_657 : u32 = y;
      y = (x_657 + bitcast<u32>(1i));
    }
  }
  x_3 = 0u;
  loop {
    let x_665 : u32 = x_3;
    if ((x_665 < 4u)) {
    } else {
      break;
    }
    z = 0u;
    loop {
      let x_673 : u32 = z;
      if ((x_673 < 4u)) {
      } else {
        break;
      }
      let x_675 : u32 = z;
      let x_677 : u32 = x_3;
      let x_680 : array<i32, 64u> = *(block_3);
      param_21 = x_680;
      inverse_lift_i1_64__u1_u1_(&(param_21), 4u, ((16u * x_675) + x_677));
      let x_682 : array<i32, 64u> = param_21;
      *(block_3) = x_682;

      continuing {
        let x_683 : u32 = z;
        z = (x_683 + bitcast<u32>(1i));
      }
    }

    continuing {
      let x_685 : u32 = x_3;
      x_3 = (x_685 + bitcast<u32>(1i));
    }
  }
  z_1 = 0u;
  loop {
    let x_693 : u32 = z_1;
    if ((x_693 < 4u)) {
    } else {
      break;
    }
    y_1 = 0u;
    loop {
      let x_701 : u32 = y_1;
      if ((x_701 < 4u)) {
      } else {
        break;
      }
      let x_703 : u32 = y_1;
      let x_705 : u32 = z_1;
      let x_709 : array<i32, 64u> = *(block_3);
      param_22 = x_709;
      inverse_lift_i1_64__u1_u1_(&(param_22), 1u, ((4u * x_703) + (16u * x_705)));
      let x_711 : array<i32, 64u> = param_22;
      *(block_3) = x_711;

      continuing {
        let x_712 : u32 = y_1;
        y_1 = (x_712 + bitcast<u32>(1i));
      }
    }

    continuing {
      let x_714 : u32 = z_1;
      z_1 = (x_714 + bitcast<u32>(1i));
    }
  }
  return;
}

fn decompress_block_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_f1_64__(reader_4 : ptr<function, BlockReader>, decompressed_block : ptr<function, array<f32, 64u>>) {
  var s_cont : u32;
  var param_23 : BlockReader;
  var emax : i32;
  var param_24 : BlockReader;
  var block_max_bits_1 : u32;
  var uint_block : array<u32, 64u>;
  var param_25 : BlockReader;
  var param_26 : array<u32, 64u>;
  var i_4 : u32;
  var int_block : array<i32, 64u>;
  var indexable : array<u32, 64u>;
  var param_27 : u32;
  var param_28 : array<i32, 64u>;
  var inv_w : f32;
  var i_5 : u32;
  let x_718 : BlockReader = *(reader_4);
  param_23 = x_718;
  let x_719 : u32 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_23));
  let x_720 : BlockReader = param_23;
  *(reader_4) = x_720;
  s_cont = x_719;
  let x_721 : u32 = s_cont;
  if ((x_721 != 0u)) {
    let x_728 : BlockReader = *(reader_4);
    param_24 = x_728;
    let x_729 : EmulateUint64 = read_bits_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_(&(param_24), 8u);
    let x_730 : BlockReader = param_24;
    *(reader_4) = x_730;
    emax = bitcast<i32>((x_729.lo - 127u));
    let x_737 : u32 = x_242.max_bits;
    block_max_bits_1 = (x_737 - 9u);
    let x_740 : u32 = block_max_bits_1;
    let x_743 : BlockReader = *(reader_4);
    param_25 = x_743;
    let x_745 : array<u32, 64u> = uint_block;
    param_26 = x_745;
    decode_ints_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_u1_64__(&(param_25), x_740, &(param_26));
    let x_747 : BlockReader = param_25;
    *(reader_4) = x_747;
    let x_748 : array<u32, 64u> = param_26;
    uint_block = x_748;
    i_4 = 0u;
    loop {
      let x_755 : u32 = i_4;
      if ((x_755 < 64u)) {
      } else {
        break;
      }
      let x_813 : u32 = i_4;
      indexable = array<u32, 64u>(0u, 1u, 4u, 16u, 20u, 17u, 5u, 2u, 8u, 32u, 21u, 6u, 18u, 24u, 9u, 33u, 36u, 3u, 12u, 48u, 22u, 25u, 37u, 40u, 34u, 10u, 7u, 19u, 28u, 13u, 49u, 52u, 41u, 38u, 26u, 23u, 29u, 53u, 11u, 35u, 44u, 14u, 50u, 56u, 42u, 27u, 39u, 45u, 30u, 54u, 57u, 60u, 51u, 15u, 43u, 46u, 58u, 61u, 55u, 31u, 62u, 59u, 47u, 63u);
      let x_816 : u32 = indexable[x_813];
      let x_817 : u32 = i_4;
      let x_820 : u32 = uint_block[x_817];
      param_27 = x_820;
      let x_821 : i32 = uint2int_u1_(&(param_27));
      int_block[x_816] = x_821;

      continuing {
        let x_823 : u32 = i_4;
        i_4 = (x_823 + bitcast<u32>(1i));
      }
    }
    let x_826 : array<i32, 64u> = int_block;
    param_28 = x_826;
    inverse_transform_i1_64__(&(param_28));
    let x_828 : array<i32, 64u> = param_28;
    int_block = x_828;
    let x_832 : i32 = emax;
    inv_w = ldexp(1.0f, (x_832 - 30i));
    i_5 = 0u;
    loop {
      let x_842 : u32 = i_5;
      if ((x_842 < 64u)) {
      } else {
        break;
      }
      let x_844 : u32 = i_5;
      let x_845 : f32 = inv_w;
      let x_846 : u32 = i_5;
      let x_848 : i32 = int_block[x_846];
      (*(decompressed_block))[x_844] = (x_845 * f32(x_848));

      continuing {
        let x_852 : u32 = i_5;
        i_5 = (x_852 + bitcast<u32>(1i));
      }
    }
  }
  return;
}

fn main_1() {
  var block_index_1 : u32;
  var total_blocks : u32;
  var reader_6 : BlockReader;
  var param_29 : u32;
  var decompressed_block_1 : array<f32, 64u>;
  var param_30 : BlockReader;
  var param_31 : array<f32, 64u>;
  var stride : vec3<u32>;
  var nblocks : vec3<u32>;
  var block_4 : vec3<u32>;
  var block_range : vec2<f32>;
  var partial : vec3<bool>;
  var partial_size : vec3<u32>;
  var x_964 : u32;
  var x_976 : u32;
  var x_988 : u32;
  var z_2 : u32;
  var y_2 : u32;
  var x_4 : u32;
  let x_860 : u32 = gl_GlobalInvocationID.x;
  let x_865 : u32 = x_863.block_id_offset;
  block_index_1 = (x_860 + (x_865 * 32u));
  let x_870 : u32 = x_242.padded_dims.x;
  let x_872 : u32 = x_242.padded_dims.y;
  let x_875 : u32 = x_242.padded_dims.z;
  total_blocks = (((x_870 * x_872) * x_875) / 64u);
  let x_878 : u32 = block_index_1;
  let x_879 : u32 = total_blocks;
  if ((x_878 >= x_879)) {
    return;
  }
  let x_886 : u32 = block_index_1;
  param_29 = x_886;
  let x_887 : BlockReader = create_block_reader_u1_(&(param_29));
  reader_6 = x_887;
  let x_890 : BlockReader = reader_6;
  param_30 = x_890;
  let x_892 : array<f32, 64u> = decompressed_block_1;
  param_31 = x_892;
  decompress_block_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_f1_64__(&(param_30), &(param_31));
  let x_894 : array<f32, 64u> = param_31;
  decompressed_block_1 = x_894;
  let x_898 : u32 = x_242.volume_dims.x;
  let x_900 : u32 = x_242.volume_dims.x;
  let x_902 : u32 = x_242.volume_dims.y;
  stride = vec3<u32>(1u, x_898, (x_900 * x_902));
  let x_907 : u32 = x_242.padded_dims.x;
  nblocks.x = (x_907 >> bitcast<u32>(2i));
  let x_911 : u32 = x_242.padded_dims.y;
  nblocks.y = (x_911 >> bitcast<u32>(2i));
  let x_915 : u32 = x_242.padded_dims.z;
  nblocks.z = (x_915 >> bitcast<u32>(2i));
  let x_919 : u32 = block_index_1;
  let x_921 : u32 = nblocks.x;
  block_4.x = ((x_919 % x_921) * 4u);
  let x_925 : u32 = block_index_1;
  let x_927 : u32 = nblocks.x;
  let x_930 : u32 = nblocks.y;
  block_4.y = (((x_925 / x_927) % x_930) * 4u);
  let x_934 : u32 = block_index_1;
  let x_936 : u32 = nblocks.x;
  let x_938 : u32 = nblocks.y;
  block_4.z = ((x_934 / (x_936 * x_938)) * 4u);
  block_range = vec2<f32>(100000002004087734272.0f, -100000002004087734272.0f);
  let x_952 : vec3<u32> = block_4;
  let x_957 : vec4<u32> = x_242.volume_dims;
  partial = ((x_952 + vec3<u32>(4u, 4u, 4u)) > vec3<u32>(x_957.x, x_957.y, x_957.z));
  let x_963 : bool = partial.x;
  if (x_963) {
    let x_968 : u32 = x_242.volume_dims.x;
    let x_970 : u32 = block_4.x;
    x_964 = (x_968 - x_970);
  } else {
    x_964 = 4u;
  }
  let x_973 : u32 = x_964;
  let x_975 : bool = partial.y;
  if (x_975) {
    let x_980 : u32 = x_242.volume_dims.y;
    let x_982 : u32 = block_4.y;
    x_976 = (x_980 - x_982);
  } else {
    x_976 = 4u;
  }
  let x_985 : u32 = x_976;
  let x_987 : bool = partial.z;
  if (x_987) {
    let x_992 : u32 = x_242.volume_dims.z;
    let x_994 : u32 = block_4.z;
    x_988 = (x_992 - x_994);
  } else {
    x_988 = 4u;
  }
  let x_997 : u32 = x_988;
  partial_size = vec3<u32>(x_973, x_985, x_997);
  z_2 = 0u;
  loop {
    let x_1005 : u32 = z_2;
    let x_1007 : u32 = partial_size.z;
    if ((x_1005 < x_1007)) {
    } else {
      break;
    }
    y_2 = 0u;
    loop {
      let x_1015 : u32 = y_2;
      let x_1017 : u32 = partial_size.y;
      if ((x_1015 < x_1017)) {
      } else {
        break;
      }
      x_4 = 0u;
      loop {
        let x_1025 : u32 = x_4;
        let x_1027 : u32 = partial_size.x;
        if ((x_1025 < x_1027)) {
        } else {
          break;
        }
        let x_1030 : f32 = block_range.x;
        let x_1031 : u32 = z_2;
        let x_1033 : u32 = y_2;
        let x_1036 : u32 = x_4;
        let x_1039 : f32 = decompressed_block_1[(((16u * x_1031) + (4u * x_1033)) + x_1036)];
        block_range.x = min(x_1030, x_1039);
        let x_1043 : f32 = block_range.y;
        let x_1044 : u32 = z_2;
        let x_1046 : u32 = y_2;
        let x_1049 : u32 = x_4;
        let x_1052 : f32 = decompressed_block_1[(((16u * x_1044) + (4u * x_1046)) + x_1049)];
        block_range.y = max(x_1043, x_1052);

        continuing {
          let x_1055 : u32 = x_4;
          x_4 = (x_1055 + bitcast<u32>(1i));
        }
      }

      continuing {
        let x_1057 : u32 = y_2;
        y_2 = (x_1057 + bitcast<u32>(1i));
      }
    }

    continuing {
      let x_1059 : u32 = z_2;
      z_2 = (x_1059 + bitcast<u32>(1i));
    }
  }
  let x_1065 : u32 = block_index_1;
  let x_1066 : vec2<f32> = block_range;
  x_1064.block_ranges[x_1065] = x_1066;
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const zfp_decompress_block_comp_spv = `struct EmulateUint64 {
  lo : u32,
  hi : u32,
}

struct BlockReader {
  current_bit : u32,
  current_word : u32,
  word_buffer : EmulateUint64,
}

struct VolumeParams {
  volume_dims : vec4<u32>,
  padded_dims : vec4<u32>,
  volume_scale : vec4<f32>,
  max_bits : u32,
  isovalue : f32,
}

struct EmulateUint64_1 {
  lo : u32,
  hi : u32,
}

type RTArr = array<EmulateUint64_1>;

struct Compressed {
  compressed : RTArr,
}

type RTArr_1 = array<u32>;

type RTArr_2 = array<u32>;

struct BlockIDs {
  block_ids : RTArr_2,
}

struct DecompressBlockOffset {
  start_block_offset : u32,
}

struct CachedItemSlots {
  cached_item_slots : RTArr_2,
}

type RTArr_3 = array<f32>;

struct Decompressed {
  decompressed : RTArr_3,
}

@group(0) @binding(1) var<uniform> x_242 : VolumeParams;

@group(0) @binding(0) var<storage, read_write> x_261 : Compressed;

@group(0) @binding(3) var<storage, read_write> x_858 : BlockIDs;

@group(1) @binding(0) var<uniform> x_861 : DecompressBlockOffset;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(0) @binding(4) var<storage, read_write> x_877 : CachedItemSlots;

@group(0) @binding(2) var<storage, read_write> x_903 : Decompressed;

fn shift_right_struct_EmulateUint64_u1_u11_u1_(a_3 : EmulateUint64, n_1 : ptr<function, u32>) -> EmulateUint64 {
  var carry_1 : u32;
  var b_3 : EmulateUint64;
  let x_167 : u32 = *(n_1);
  if ((x_167 == 0u)) {
    return a_3;
  }
  let x_172 : u32 = *(n_1);
  if ((x_172 < 32u)) {
    let x_178 : u32 = *(n_1);
    carry_1 = (a_3.hi & (4294967295u >> (32u - x_178)));
    let x_184 : u32 = *(n_1);
    let x_186 : u32 = carry_1;
    let x_187 : u32 = *(n_1);
    b_3.lo = ((a_3.lo >> x_184) | (x_186 << (32u - x_187)));
    let x_193 : u32 = *(n_1);
    b_3.hi = (a_3.hi >> x_193);
  } else {
    let x_198 : u32 = *(n_1);
    b_3.lo = (a_3.hi >> (x_198 - 32u));
    b_3.hi = 0u;
  }
  let x_203 : EmulateUint64 = b_3;
  return x_203;
}

fn create_block_reader_u1_(block_index : ptr<function, u32>) -> BlockReader {
  var reader_5 : BlockReader;
  var param_2 : u32;
  let x_237 : u32 = *(block_index);
  let x_246 : u32 = x_242.max_bits;
  reader_5.current_word = ((x_237 * x_246) / 64u);
  let x_250 : u32 = *(block_index);
  let x_252 : u32 = x_242.max_bits;
  reader_5.current_bit = ((x_250 * x_252) % 64u);
  let x_263 : u32 = reader_5.current_word;
  let x_266 : EmulateUint64_1 = x_261.compressed[x_263];
  reader_5.word_buffer.lo = x_266.lo;
  reader_5.word_buffer.hi = x_266.hi;
  let x_273 : EmulateUint64 = reader_5.word_buffer;
  let x_276 : u32 = reader_5.current_bit;
  param_2 = x_276;
  let x_277 : EmulateUint64 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_273, &(param_2));
  reader_5.word_buffer = x_277;
  let x_279 : BlockReader = reader_5;
  return x_279;
}

fn advance_word_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(reader : ptr<function, BlockReader>) {
  (*(reader)).current_bit = 0u;
  let x_284 : u32 = (*(reader)).current_word;
  (*(reader)).current_word = (x_284 + bitcast<u32>(1i));
  let x_287 : u32 = (*(reader)).current_word;
  let x_289 : EmulateUint64_1 = x_261.compressed[x_287];
  (*(reader)).word_buffer.lo = x_289.lo;
  (*(reader)).word_buffer.hi = x_289.hi;
  return;
}

fn read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(reader_1 : ptr<function, BlockReader>) -> u32 {
  var bit : u32;
  var param_3 : u32;
  var param_4 : BlockReader;
  let x_297 : u32 = (*(reader_1)).word_buffer.lo;
  bit = (x_297 & 1u);
  let x_301 : u32 = (*(reader_1)).current_bit;
  (*(reader_1)).current_bit = (x_301 + bitcast<u32>(1i));
  let x_304 : EmulateUint64 = (*(reader_1)).word_buffer;
  param_3 = 1u;
  let x_306 : EmulateUint64 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_304, &(param_3));
  (*(reader_1)).word_buffer = x_306;
  let x_309 : u32 = (*(reader_1)).current_bit;
  if ((x_309 >= 64u)) {
    let x_314 : BlockReader = *(reader_1);
    param_4 = x_314;
    advance_word_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_4));
    let x_316 : BlockReader = param_4;
    *(reader_1) = x_316;
  }
  let x_317 : u32 = bit;
  return x_317;
}

fn make_emulate_uint64_u1_u1_(hi : ptr<function, u32>, lo : ptr<function, u32>) -> EmulateUint64 {
  var a_4 : EmulateUint64;
  let x_92 : u32 = *(lo);
  a_4.lo = x_92;
  let x_95 : u32 = *(hi);
  a_4.hi = x_95;
  let x_97 : EmulateUint64 = a_4;
  return x_97;
}

fn make_mask_u1_(n_2 : ptr<function, u32>) -> EmulateUint64 {
  var a_5 : EmulateUint64;
  var param : u32;
  var param_1 : u32;
  param = 0u;
  param_1 = 0u;
  let x_209 : EmulateUint64 = make_emulate_uint64_u1_u1_(&(param), &(param_1));
  a_5 = x_209;
  let x_210 : u32 = *(n_2);
  let x_212 : u32 = *(n_2);
  if (((x_210 > 0u) & (x_212 < 65u))) {
    let x_218 : u32 = *(n_2);
    if ((x_218 > 32u)) {
      a_5.lo = 4294967295u;
      let x_223 : u32 = *(n_2);
      a_5.hi = (4294967295u >> (64u - x_223));
    } else {
      let x_228 : u32 = *(n_2);
      a_5.lo = (4294967295u >> (32u - x_228));
      a_5.hi = 0u;
    }
  }
  let x_233 : EmulateUint64 = a_5;
  return x_233;
}

fn bitwise_and_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(a : EmulateUint64, b : EmulateUint64) -> EmulateUint64 {
  var c : EmulateUint64;
  c.lo = (a.lo & b.lo);
  c.hi = (a.hi & b.hi);
  let x_109 : EmulateUint64 = c;
  return x_109;
}

fn shift_left_struct_EmulateUint64_u1_u11_u1_(a_2 : EmulateUint64, n : ptr<function, u32>) -> EmulateUint64 {
  var carry : u32;
  var b_2 : EmulateUint64;
  let x_124 : u32 = *(n);
  if ((x_124 == 0u)) {
    return a_2;
  }
  let x_131 : u32 = *(n);
  if ((x_131 < 32u)) {
    let x_139 : u32 = *(n);
    carry = (a_2.lo & (4294967295u << (32u - x_139)));
    let x_145 : u32 = *(n);
    b_2.lo = (a_2.lo << x_145);
    let x_149 : u32 = *(n);
    let x_151 : u32 = carry;
    let x_152 : u32 = *(n);
    b_2.hi = ((a_2.hi << x_149) | (x_151 >> (32u - x_152)));
  } else {
    b_2.lo = 0u;
    let x_160 : u32 = *(n);
    b_2.hi = (a_2.lo << (x_160 - 32u));
  }
  let x_164 : EmulateUint64 = b_2;
  return x_164;
}

fn bitwise_or_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(a_1 : EmulateUint64, b_1 : EmulateUint64) -> EmulateUint64 {
  var c_1 : EmulateUint64;
  c_1.lo = (a_1.lo | b_1.lo);
  c_1.hi = (a_1.hi | b_1.hi);
  let x_121 : EmulateUint64 = c_1;
  return x_121;
}

fn read_bits_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_(reader_2 : ptr<function, BlockReader>, n_bits : u32) -> EmulateUint64 {
  var rem_bits : u32;
  var first_read : u32;
  var mask : EmulateUint64;
  var param_5 : u32;
  var bits : EmulateUint64;
  var param_6 : u32;
  var next_read : u32;
  var param_7 : BlockReader;
  var param_8 : u32;
  var param_9 : u32;
  var param_10 : u32;
  let x_322 : u32 = (*(reader_2)).current_bit;
  rem_bits = (64u - x_322);
  let x_325 : u32 = rem_bits;
  first_read = min(x_325, n_bits);
  let x_329 : u32 = first_read;
  param_5 = x_329;
  let x_330 : EmulateUint64 = make_mask_u1_(&(param_5));
  mask = x_330;
  let x_333 : EmulateUint64 = (*(reader_2)).word_buffer;
  let x_334 : EmulateUint64 = mask;
  let x_335 : EmulateUint64 = bitwise_and_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_333, x_334);
  bits = x_335;
  let x_337 : EmulateUint64 = (*(reader_2)).word_buffer;
  param_6 = n_bits;
  let x_339 : EmulateUint64 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_337, &(param_6));
  (*(reader_2)).word_buffer = x_339;
  let x_341 : u32 = first_read;
  let x_343 : u32 = (*(reader_2)).current_bit;
  (*(reader_2)).current_bit = (x_343 + x_341);
  next_read = 0u;
  let x_347 : u32 = rem_bits;
  if ((n_bits >= x_347)) {
    let x_352 : BlockReader = *(reader_2);
    param_7 = x_352;
    advance_word_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_7));
    let x_354 : BlockReader = param_7;
    *(reader_2) = x_354;
    let x_355 : u32 = first_read;
    next_read = (n_bits - x_355);
  }
  let x_358 : u32 = next_read;
  param_8 = x_358;
  let x_359 : EmulateUint64 = make_mask_u1_(&(param_8));
  mask = x_359;
  let x_360 : EmulateUint64 = bits;
  let x_362 : EmulateUint64 = (*(reader_2)).word_buffer;
  let x_363 : EmulateUint64 = mask;
  let x_364 : EmulateUint64 = bitwise_and_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_362, x_363);
  let x_366 : u32 = first_read;
  param_9 = x_366;
  let x_367 : EmulateUint64 = shift_left_struct_EmulateUint64_u1_u11_u1_(x_364, &(param_9));
  let x_368 : EmulateUint64 = bitwise_or_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_360, x_367);
  bits = x_368;
  let x_370 : EmulateUint64 = (*(reader_2)).word_buffer;
  let x_372 : u32 = next_read;
  param_10 = x_372;
  let x_373 : EmulateUint64 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_370, &(param_10));
  (*(reader_2)).word_buffer = x_373;
  let x_375 : u32 = next_read;
  let x_377 : u32 = (*(reader_2)).current_bit;
  (*(reader_2)).current_bit = (x_377 + x_375);
  let x_380 : EmulateUint64 = bits;
  return x_380;
}

fn decode_ints_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_u1_64__(reader_3 : ptr<function, BlockReader>, block_max_bits : u32, block_1 : ptr<function, array<u32, 64u>>) {
  var i : u32;
  var x_1 : EmulateUint64;
  var param_11 : u32;
  var param_12 : u32;
  var one : EmulateUint64;
  var param_13 : u32;
  var param_14 : u32;
  var bits_1 : u32;
  var k : u32;
  var n_3 : u32;
  var m : u32;
  var param_15 : BlockReader;
  var param_16 : BlockReader;
  var param_17 : BlockReader;
  var param_18 : u32;
  var i_1 : u32;
  var param_19 : u32;
  i = 0u;
  loop {
    let x_396 : u32 = i;
    if ((x_396 < 64u)) {
    } else {
      break;
    }
    let x_398 : u32 = i;
    (*(block_1))[x_398] = 0u;

    continuing {
      let x_400 : u32 = i;
      i = (x_400 + bitcast<u32>(1i));
    }
  }
  param_11 = 0u;
  param_12 = 0u;
  let x_405 : EmulateUint64 = make_emulate_uint64_u1_u1_(&(param_11), &(param_12));
  x_1 = x_405;
  param_13 = 0u;
  param_14 = 1u;
  let x_409 : EmulateUint64 = make_emulate_uint64_u1_u1_(&(param_13), &(param_14));
  one = x_409;
  bits_1 = block_max_bits;
  k = 32u;
  n_3 = 0u;
  loop {
    var x_424 : bool;
    var x_425 : bool;
    let x_418 : u32 = bits_1;
    let x_419 : bool = (x_418 != 0u);
    x_425 = x_419;
    if (x_419) {
      let x_422 : u32 = k;
      k = (x_422 - bitcast<u32>(1i));
      x_424 = (x_422 > 0u);
      x_425 = x_424;
    }
    if (x_425) {
    } else {
      break;
    }
    let x_427 : u32 = n_3;
    let x_428 : u32 = bits_1;
    m = min(x_427, x_428);
    let x_430 : u32 = m;
    let x_431 : u32 = bits_1;
    bits_1 = (x_431 - x_430);
    let x_433 : u32 = m;
    let x_435 : BlockReader = *(reader_3);
    param_15 = x_435;
    let x_436 : EmulateUint64 = read_bits_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_(&(param_15), x_433);
    let x_437 : BlockReader = param_15;
    *(reader_3) = x_437;
    x_1 = x_436;
    loop {
      var x_456 : bool;
      var x_457 : bool;
      let x_443 : u32 = n_3;
      let x_445 : u32 = bits_1;
      let x_447 : bool = ((x_443 < 64u) & (x_445 != 0u));
      x_457 = x_447;
      if (x_447) {
        let x_450 : u32 = bits_1;
        bits_1 = (x_450 - bitcast<u32>(1i));
        let x_453 : BlockReader = *(reader_3);
        param_16 = x_453;
        let x_454 : u32 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_16));
        let x_455 : BlockReader = param_16;
        *(reader_3) = x_455;
        x_456 = (x_454 != 0u);
        x_457 = x_456;
      }
      if (x_457) {
      } else {
        break;
      }
      loop {
        var x_477 : bool;
        var x_478 : bool;
        let x_463 : u32 = n_3;
        let x_466 : u32 = bits_1;
        let x_468 : bool = ((x_463 < 63u) & (x_466 != 0u));
        x_478 = x_468;
        if (x_468) {
          let x_471 : u32 = bits_1;
          bits_1 = (x_471 - bitcast<u32>(1i));
          let x_474 : BlockReader = *(reader_3);
          param_17 = x_474;
          let x_475 : u32 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_17));
          let x_476 : BlockReader = param_17;
          *(reader_3) = x_476;
          x_477 = (x_475 == 0u);
          x_478 = x_477;
        }
        if (x_478) {
        } else {
          break;
        }

        continuing {
          let x_479 : u32 = n_3;
          n_3 = (x_479 + bitcast<u32>(1i));
        }
      }

      continuing {
        let x_481 : EmulateUint64 = x_1;
        let x_482 : EmulateUint64 = one;
        let x_483 : u32 = n_3;
        n_3 = (x_483 + bitcast<u32>(1i));
        param_18 = x_483;
        let x_486 : EmulateUint64 = shift_left_struct_EmulateUint64_u1_u11_u1_(x_482, &(param_18));
        let x_487 : EmulateUint64 = bitwise_or_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_481, x_486);
        x_1 = x_487;
      }
    }
    i_1 = 0u;
    loop {
      let x_494 : u32 = i_1;
      if ((x_494 < 64u)) {
      } else {
        break;
      }
      let x_496 : u32 = i_1;
      let x_498 : u32 = x_1.lo;
      let x_500 : u32 = k;
      let x_503 : u32 = (*(block_1))[x_496];
      (*(block_1))[x_496] = (x_503 + ((x_498 & 1u) << x_500));

      continuing {
        let x_506 : u32 = i_1;
        i_1 = (x_506 + bitcast<u32>(1i));
        let x_508 : EmulateUint64 = x_1;
        param_19 = 1u;
        let x_510 : EmulateUint64 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_508, &(param_19));
        x_1 = x_510;
      }
    }
  }
  return;
}

fn uint2int_u1_(x : ptr<function, u32>) -> i32 {
  let x_383 : u32 = *(x);
  return bitcast<i32>(((x_383 ^ 2863311530u) - 2863311530u));
}

fn inverse_lift_i1_64__u1_u1_(block_2 : ptr<function, array<i32, 64u>>, s : u32, idx : u32) {
  var i_2 : u32;
  var v : vec4<i32>;
  var i_3 : u32;
  i_2 = 0u;
  loop {
    let x_517 : u32 = i_2;
    if ((x_517 < 4u)) {
    } else {
      break;
    }
    let x_523 : u32 = i_2;
    let x_524 : u32 = i_2;
    let x_529 : i32 = (*(block_2))[(idx + (x_524 * s))];
    v[x_523] = x_529;

    continuing {
      let x_531 : u32 = i_2;
      i_2 = (x_531 + bitcast<u32>(1i));
    }
  }
  let x_535 : i32 = v.w;
  let x_538 : i32 = v.y;
  v.y = (x_538 + (x_535 >> bitcast<u32>(1i)));
  let x_542 : i32 = v.y;
  let x_545 : i32 = v.w;
  v.w = (x_545 - (x_542 >> bitcast<u32>(1i)));
  let x_549 : i32 = v.w;
  let x_551 : i32 = v.y;
  v.y = (x_551 + x_549);
  let x_555 : i32 = v.w;
  v.w = (x_555 << bitcast<u32>(1i));
  let x_559 : i32 = v.y;
  let x_561 : i32 = v.w;
  v.w = (x_561 - x_559);
  let x_565 : i32 = v.x;
  let x_568 : i32 = v.z;
  v.z = (x_568 + x_565);
  let x_572 : i32 = v.x;
  v.x = (x_572 << bitcast<u32>(1i));
  let x_576 : i32 = v.z;
  let x_578 : i32 = v.x;
  v.x = (x_578 - x_576);
  let x_582 : i32 = v.z;
  let x_584 : i32 = v.y;
  v.y = (x_584 + x_582);
  let x_588 : i32 = v.z;
  v.z = (x_588 << bitcast<u32>(1i));
  let x_592 : i32 = v.y;
  let x_594 : i32 = v.z;
  v.z = (x_594 - x_592);
  let x_598 : i32 = v.x;
  let x_600 : i32 = v.w;
  v.w = (x_600 + x_598);
  let x_604 : i32 = v.x;
  v.x = (x_604 << bitcast<u32>(1i));
  let x_608 : i32 = v.w;
  let x_610 : i32 = v.x;
  v.x = (x_610 - x_608);
  i_3 = 0u;
  loop {
    let x_619 : u32 = i_3;
    if ((x_619 < 4u)) {
    } else {
      break;
    }
    let x_621 : u32 = i_3;
    let x_624 : u32 = i_3;
    let x_626 : i32 = v[x_624];
    (*(block_2))[(idx + (x_621 * s))] = x_626;

    continuing {
      let x_628 : u32 = i_3;
      i_3 = (x_628 + bitcast<u32>(1i));
    }
  }
  return;
}

fn inverse_transform_i1_64__(block_3 : ptr<function, array<i32, 64u>>) {
  var y : u32;
  var x_2 : u32;
  var param_20 : array<i32, 64u>;
  var x_3 : u32;
  var z : u32;
  var param_21 : array<i32, 64u>;
  var z_1 : u32;
  var y_1 : u32;
  var param_22 : array<i32, 64u>;
  y = 0u;
  loop {
    let x_636 : u32 = y;
    if ((x_636 < 4u)) {
    } else {
      break;
    }
    x_2 = 0u;
    loop {
      let x_644 : u32 = x_2;
      if ((x_644 < 4u)) {
      } else {
        break;
      }
      let x_647 : u32 = x_2;
      let x_648 : u32 = y;
      let x_652 : array<i32, 64u> = *(block_3);
      param_20 = x_652;
      inverse_lift_i1_64__u1_u1_(&(param_20), 16u, (x_647 + (4u * x_648)));
      let x_654 : array<i32, 64u> = param_20;
      *(block_3) = x_654;

      continuing {
        let x_655 : u32 = x_2;
        x_2 = (x_655 + bitcast<u32>(1i));
      }
    }

    continuing {
      let x_657 : u32 = y;
      y = (x_657 + bitcast<u32>(1i));
    }
  }
  x_3 = 0u;
  loop {
    let x_665 : u32 = x_3;
    if ((x_665 < 4u)) {
    } else {
      break;
    }
    z = 0u;
    loop {
      let x_673 : u32 = z;
      if ((x_673 < 4u)) {
      } else {
        break;
      }
      let x_675 : u32 = z;
      let x_677 : u32 = x_3;
      let x_680 : array<i32, 64u> = *(block_3);
      param_21 = x_680;
      inverse_lift_i1_64__u1_u1_(&(param_21), 4u, ((16u * x_675) + x_677));
      let x_682 : array<i32, 64u> = param_21;
      *(block_3) = x_682;

      continuing {
        let x_683 : u32 = z;
        z = (x_683 + bitcast<u32>(1i));
      }
    }

    continuing {
      let x_685 : u32 = x_3;
      x_3 = (x_685 + bitcast<u32>(1i));
    }
  }
  z_1 = 0u;
  loop {
    let x_693 : u32 = z_1;
    if ((x_693 < 4u)) {
    } else {
      break;
    }
    y_1 = 0u;
    loop {
      let x_701 : u32 = y_1;
      if ((x_701 < 4u)) {
      } else {
        break;
      }
      let x_703 : u32 = y_1;
      let x_705 : u32 = z_1;
      let x_709 : array<i32, 64u> = *(block_3);
      param_22 = x_709;
      inverse_lift_i1_64__u1_u1_(&(param_22), 1u, ((4u * x_703) + (16u * x_705)));
      let x_711 : array<i32, 64u> = param_22;
      *(block_3) = x_711;

      continuing {
        let x_712 : u32 = y_1;
        y_1 = (x_712 + bitcast<u32>(1i));
      }
    }

    continuing {
      let x_714 : u32 = z_1;
      z_1 = (x_714 + bitcast<u32>(1i));
    }
  }
  return;
}

fn decompress_block_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_f1_64__(reader_4 : ptr<function, BlockReader>, decompressed_block : ptr<function, array<f32, 64u>>) {
  var s_cont : u32;
  var param_23 : BlockReader;
  var emax : i32;
  var param_24 : BlockReader;
  var block_max_bits_1 : u32;
  var uint_block : array<u32, 64u>;
  var param_25 : BlockReader;
  var param_26 : array<u32, 64u>;
  var i_4 : u32;
  var int_block : array<i32, 64u>;
  var indexable : array<u32, 64u>;
  var param_27 : u32;
  var param_28 : array<i32, 64u>;
  var inv_w : f32;
  var i_5 : u32;
  let x_718 : BlockReader = *(reader_4);
  param_23 = x_718;
  let x_719 : u32 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_23));
  let x_720 : BlockReader = param_23;
  *(reader_4) = x_720;
  s_cont = x_719;
  let x_721 : u32 = s_cont;
  if ((x_721 != 0u)) {
    let x_728 : BlockReader = *(reader_4);
    param_24 = x_728;
    let x_729 : EmulateUint64 = read_bits_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_(&(param_24), 8u);
    let x_730 : BlockReader = param_24;
    *(reader_4) = x_730;
    emax = bitcast<i32>((x_729.lo - 127u));
    let x_737 : u32 = x_242.max_bits;
    block_max_bits_1 = (x_737 - 9u);
    let x_740 : u32 = block_max_bits_1;
    let x_743 : BlockReader = *(reader_4);
    param_25 = x_743;
    let x_745 : array<u32, 64u> = uint_block;
    param_26 = x_745;
    decode_ints_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_u1_64__(&(param_25), x_740, &(param_26));
    let x_747 : BlockReader = param_25;
    *(reader_4) = x_747;
    let x_748 : array<u32, 64u> = param_26;
    uint_block = x_748;
    i_4 = 0u;
    loop {
      let x_755 : u32 = i_4;
      if ((x_755 < 64u)) {
      } else {
        break;
      }
      let x_813 : u32 = i_4;
      indexable = array<u32, 64u>(0u, 1u, 4u, 16u, 20u, 17u, 5u, 2u, 8u, 32u, 21u, 6u, 18u, 24u, 9u, 33u, 36u, 3u, 12u, 48u, 22u, 25u, 37u, 40u, 34u, 10u, 7u, 19u, 28u, 13u, 49u, 52u, 41u, 38u, 26u, 23u, 29u, 53u, 11u, 35u, 44u, 14u, 50u, 56u, 42u, 27u, 39u, 45u, 30u, 54u, 57u, 60u, 51u, 15u, 43u, 46u, 58u, 61u, 55u, 31u, 62u, 59u, 47u, 63u);
      let x_816 : u32 = indexable[x_813];
      let x_817 : u32 = i_4;
      let x_820 : u32 = uint_block[x_817];
      param_27 = x_820;
      let x_821 : i32 = uint2int_u1_(&(param_27));
      int_block[x_816] = x_821;

      continuing {
        let x_823 : u32 = i_4;
        i_4 = (x_823 + bitcast<u32>(1i));
      }
    }
    let x_826 : array<i32, 64u> = int_block;
    param_28 = x_826;
    inverse_transform_i1_64__(&(param_28));
    let x_828 : array<i32, 64u> = param_28;
    int_block = x_828;
    let x_832 : i32 = emax;
    inv_w = ldexp(1.0f, (x_832 - 30i));
    i_5 = 0u;
    loop {
      let x_842 : u32 = i_5;
      if ((x_842 < 64u)) {
      } else {
        break;
      }
      let x_844 : u32 = i_5;
      let x_845 : f32 = inv_w;
      let x_846 : u32 = i_5;
      let x_848 : i32 = int_block[x_846];
      (*(decompressed_block))[x_844] = (x_845 * f32(x_848));

      continuing {
        let x_852 : u32 = i_5;
        i_5 = (x_852 + bitcast<u32>(1i));
      }
    }
  }
  return;
}

fn main_1() {
  var block_index_1 : u32;
  var cache_location : u32;
  var reader_6 : BlockReader;
  var param_29 : u32;
  var decompressed_block_1 : array<f32, 64u>;
  var param_30 : BlockReader;
  var param_31 : array<f32, 64u>;
  var i_6 : u32;
  let x_863 : u32 = x_861.start_block_offset;
  let x_869 : u32 = gl_GlobalInvocationID.x;
  let x_872 : u32 = x_858.block_ids[(x_863 + x_869)];
  block_index_1 = x_872;
  let x_878 : u32 = block_index_1;
  let x_880 : u32 = x_877.cached_item_slots[x_878];
  cache_location = x_880;
  let x_883 : u32 = block_index_1;
  param_29 = x_883;
  let x_884 : BlockReader = create_block_reader_u1_(&(param_29));
  reader_6 = x_884;
  let x_887 : BlockReader = reader_6;
  param_30 = x_887;
  let x_889 : array<f32, 64u> = decompressed_block_1;
  param_31 = x_889;
  decompress_block_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_f1_64__(&(param_30), &(param_31));
  let x_891 : array<f32, 64u> = param_31;
  decompressed_block_1 = x_891;
  i_6 = 0u;
  loop {
    let x_898 : u32 = i_6;
    if ((x_898 < 64u)) {
    } else {
      break;
    }
    let x_904 : u32 = cache_location;
    let x_906 : u32 = i_6;
    let x_908 : u32 = i_6;
    let x_910 : f32 = decompressed_block_1[x_908];
    x_903.decompressed[((x_904 * 64u) + x_906)] = x_910;

    continuing {
      let x_913 : u32 = i_6;
      i_6 = (x_913 + bitcast<u32>(1i));
    }
  }
  return;
}

@compute @workgroup_size(1i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const compute_block_active_comp_spv = `struct VolumeParams {
  volume_dims : vec4<u32>,
  padded_dims : vec4<u32>,
  volume_scale : vec4<f32>,
  max_bits : u32,
  isovalue : f32,
}

type RTArr = array<u32>;

struct BlockActive {
  block_active : RTArr,
}

type RTArr_1 = array<vec2<f32>>;

struct BlockRanges {
  block_ranges : RTArr_1,
}

@group(0) @binding(0) var<uniform> x_15 : VolumeParams;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(0) @binding(2) var<storage, read_write> x_50 : BlockActive;

@group(0) @binding(1) var<storage, read_write> x_61 : BlockRanges;

fn main_1() {
  var n_blocks : vec3<u32>;
  var block_id : u32;
  var range : vec2<f32>;
  var k : i32;
  var j : i32;
  var i : i32;
  var neighbor : vec3<i32>;
  var coords : vec3<i32>;
  var neighbor_id : i32;
  var block_range : vec2<f32>;
  var union_range : vec2<f32>;
  var x_81 : bool;
  var x_82 : bool;
  let x_20 : vec4<u32> = x_15.padded_dims;
  n_blocks = (vec3<u32>(x_20.x, x_20.y, x_20.z) / vec3<u32>(4u, 4u, 4u));
  let x_32 : u32 = gl_GlobalInvocationID.x;
  let x_34 : u32 = n_blocks.x;
  let x_37 : u32 = gl_GlobalInvocationID.y;
  let x_39 : u32 = n_blocks.y;
  let x_42 : u32 = gl_GlobalInvocationID.z;
  block_id = (x_32 + (x_34 * (x_37 + (x_39 * x_42))));
  let x_52 : u32 = block_id;
  x_50.block_active[x_52] = 0u;
  let x_62 : u32 = block_id;
  let x_65 : vec2<f32> = x_61.block_ranges[x_62];
  range = x_65;
  let x_70 : f32 = x_15.isovalue;
  let x_73 : f32 = range.x;
  let x_74 : bool = (x_70 >= x_73);
  x_82 = x_74;
  if (x_74) {
    let x_78 : f32 = x_15.isovalue;
    let x_80 : f32 = range.y;
    x_81 = (x_78 <= x_80);
    x_82 = x_81;
  }
  if (x_82) {
    let x_85 : u32 = block_id;
    x_50.block_active[x_85] = 1u;
  } else {
    k = -1i;
    loop {
      let x_96 : i32 = k;
      if ((x_96 < 2i)) {
      } else {
        break;
      }
      j = -1i;
      loop {
        let x_105 : i32 = j;
        if ((x_105 < 2i)) {
        } else {
          break;
        }
        i = -1i;
        loop {
          var x_137 : bool;
          var x_138 : bool;
          var x_146 : bool;
          var x_147 : bool;
          var x_195 : bool;
          var x_196 : bool;
          let x_113 : i32 = i;
          if ((x_113 < 2i)) {
          } else {
            break;
          }
          let x_118 : i32 = i;
          let x_119 : i32 = j;
          let x_120 : i32 = k;
          neighbor = vec3<i32>(x_118, x_119, x_120);
          let x_123 : vec3<u32> = gl_GlobalInvocationID;
          let x_125 : vec3<i32> = neighbor;
          coords = (bitcast<vec3<i32>>(x_123) + x_125);
          let x_127 : vec3<i32> = neighbor;
          let x_131 : bool = all((x_127 == vec3<i32>(0i, 0i, 0i)));
          x_138 = x_131;
          if (!(x_131)) {
            let x_135 : vec3<i32> = coords;
            x_137 = any((x_135 < vec3<i32>(0i, 0i, 0i)));
            x_138 = x_137;
          }
          x_147 = x_138;
          if (!(x_138)) {
            let x_142 : vec3<i32> = coords;
            let x_144 : vec3<u32> = n_blocks;
            x_146 = any((bitcast<vec3<u32>>(x_142) >= x_144));
            x_147 = x_146;
          }
          if (x_147) {
            continue;
          }
          let x_153 : i32 = coords.x;
          let x_155 : u32 = n_blocks.x;
          let x_158 : i32 = coords.y;
          let x_160 : u32 = n_blocks.y;
          let x_163 : i32 = coords.z;
          neighbor_id = (x_153 + (bitcast<i32>(x_155) * (x_158 + (bitcast<i32>(x_160) * x_163))));
          let x_169 : i32 = neighbor_id;
          let x_171 : vec2<f32> = x_61.block_ranges[x_169];
          block_range = x_171;
          let x_174 : f32 = range.x;
          let x_176 : f32 = block_range.x;
          let x_179 : f32 = range.y;
          let x_181 : f32 = block_range.y;
          union_range = vec2<f32>(min(x_174, x_176), max(x_179, x_181));
          let x_185 : f32 = x_15.isovalue;
          let x_187 : f32 = union_range.x;
          let x_188 : bool = (x_185 >= x_187);
          x_196 = x_188;
          if (x_188) {
            let x_192 : f32 = x_15.isovalue;
            let x_194 : f32 = union_range.y;
            x_195 = (x_192 <= x_194);
            x_196 = x_195;
          }
          if (x_196) {
            let x_199 : u32 = block_id;
            x_50.block_active[x_199] = 1u;
            return;
          }

          continuing {
            let x_202 : i32 = i;
            i = (x_202 + 1i);
          }
        }

        continuing {
          let x_204 : i32 = j;
          j = (x_204 + 1i);
        }
      }

      continuing {
        let x_206 : i32 = k;
        k = (x_206 + 1i);
      }
    }
  }
  return;
}

@compute @workgroup_size(1i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const compute_block_has_vertices_comp_spv = `struct VolumeParams {
  volume_dims : vec4<u32>,
  padded_dims : vec4<u32>,
  volume_scale : vec4<f32>,
  max_bits : u32,
  isovalue : f32,
}

type RTArr = array<u32>;

type RTArr_1 = array<u32>;

struct BlockActive {
  block_active : RTArr_1,
}

type RTArr_2 = array<u32>;

struct BlockLocations {
  block_locations : RTArr_1,
}

type RTArr_3 = array<f32>;

struct Decompressed {
  decompressed : RTArr_3,
}

struct BlockIDOffset {
  block_id_offset : u32,
}

type RTArr_4 = array<u32>;

struct BlockIDs {
  block_ids : RTArr_1,
}

type Arr = array<vec4<i32>, 1024u>;

struct TriTable {
  tri_table : Arr,
}

struct BlockHasVertices {
  block_has_vertices : RTArr_1,
}

@group(0) @binding(0) var<uniform> x_54 : VolumeParams;

var<workgroup> volume_block : array<f32, 128u>;

@group(0) @binding(3) var<storage, read_write> x_255 : BlockActive;

@group(0) @binding(4) var<storage, read_write> x_388 : BlockLocations;

@group(0) @binding(2) var<storage, read_write> x_403 : Decompressed;

var<private> gl_LocalInvocationID : vec3<u32>;

var<workgroup> voxel_vertices : array<u32, 64u>;

var<private> gl_WorkGroupID : vec3<u32>;

@group(1) @binding(1) var<uniform> x_658 : BlockIDOffset;

@group(0) @binding(5) var<storage, read_write> x_666 : BlockIDs;

@group(0) @binding(1) var<uniform> x_727 : TriTable;

@group(1) @binding(0) var<storage, read_write> x_768 : BlockHasVertices;

fn block_id_to_pos_u1_(id : ptr<function, u32>) -> vec3<u32> {
  var n_blocks : vec3<u32>;
  let x_59 : vec4<u32> = x_54.padded_dims;
  n_blocks = (vec3<u32>(x_59.x, x_59.y, x_59.z) / vec3<u32>(4u, 4u, 4u));
  let x_64 : u32 = *(id);
  let x_67 : u32 = n_blocks.x;
  let x_69 : u32 = *(id);
  let x_71 : u32 = n_blocks.x;
  let x_75 : u32 = n_blocks.y;
  let x_77 : u32 = *(id);
  let x_79 : u32 = n_blocks.x;
  let x_81 : u32 = n_blocks.y;
  return vec3<u32>((x_64 % x_67), ((x_69 / x_71) % x_75), (x_77 / (x_79 * x_81)));
}

fn compute_block_id_vu3_(block_pos : ptr<function, vec3<u32>>) -> u32 {
  var n_blocks_1 : vec3<u32>;
  let x_89 : vec4<u32> = x_54.padded_dims;
  n_blocks_1 = (vec3<u32>(x_89.x, x_89.y, x_89.z) / vec3<u32>(4u, 4u, 4u));
  let x_93 : u32 = (*(block_pos)).x;
  let x_95 : u32 = n_blocks_1.x;
  let x_97 : u32 = (*(block_pos)).y;
  let x_99 : u32 = n_blocks_1.y;
  let x_102 : u32 = (*(block_pos)).z;
  return (x_93 + (x_95 * (x_97 + (x_99 * x_102))));
}

fn compute_block_dims_with_ghost_vu3_(block_pos_1 : vec3<u32>) -> vec3<u32> {
  var n_blocks_2 : vec3<u32>;
  var block_dims_3 : vec3<u32>;
  var corner : u32;
  var param : vec3<u32>;
  var edge : u32;
  var param_1 : vec3<u32>;
  var edge_1 : u32;
  var param_2 : vec3<u32>;
  var edge_2 : u32;
  var param_3 : vec3<u32>;
  var face : u32;
  var param_4 : vec3<u32>;
  var face_1 : u32;
  var param_5 : vec3<u32>;
  var face_2 : u32;
  var param_6 : vec3<u32>;
  let x_211 : vec4<u32> = x_54.padded_dims;
  n_blocks_2 = (vec3<u32>(x_211.x, x_211.y, x_211.z) / vec3<u32>(4u, 4u, 4u));
  block_dims_3 = vec3<u32>(4u, 4u, 4u);
  let x_218 : u32 = n_blocks_2.x;
  if (((block_pos_1.x + 1u) < x_218)) {
    block_dims_3.x = 5u;
  }
  let x_227 : u32 = n_blocks_2.y;
  if (((block_pos_1.y + 1u) < x_227)) {
    block_dims_3.y = 5u;
  }
  let x_235 : u32 = n_blocks_2.z;
  if (((block_pos_1.z + 1u) < x_235)) {
    block_dims_3.z = 5u;
  }
  let x_240 : vec3<u32> = block_dims_3;
  if (all((x_240 == vec3<u32>(5u, 5u, 5u)))) {
    param = (block_pos_1 + vec3<u32>(1u, 1u, 1u));
    let x_251 : u32 = compute_block_id_vu3_(&(param));
    corner = x_251;
    let x_256 : u32 = corner;
    let x_259 : u32 = x_255.block_active[x_256];
    if ((x_259 == 0u)) {
      block_dims_3 = vec3<u32>(4u, 4u, 4u);
    }
  }
  let x_264 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_264.x, x_264.y) == vec2<u32>(5u, 5u)))) {
    param_1 = (block_pos_1 + vec3<u32>(1u, 1u, 0u));
    let x_276 : u32 = compute_block_id_vu3_(&(param_1));
    edge = x_276;
    let x_277 : u32 = edge;
    let x_279 : u32 = x_255.block_active[x_277];
    if ((x_279 == 0u)) {
      block_dims_3.x = vec2<u32>(4u, 4u).x;
      block_dims_3.y = vec2<u32>(4u, 4u).y;
    }
  }
  let x_288 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_288.x, x_288.z) == vec2<u32>(5u, 5u)))) {
    param_2 = (block_pos_1 + vec3<u32>(1u, 0u, 1u));
    let x_298 : u32 = compute_block_id_vu3_(&(param_2));
    edge_1 = x_298;
    let x_299 : u32 = edge_1;
    let x_301 : u32 = x_255.block_active[x_299];
    if ((x_301 == 0u)) {
      block_dims_3.x = vec2<u32>(4u, 4u).x;
      block_dims_3.z = vec2<u32>(4u, 4u).y;
    }
  }
  let x_309 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_309.y, x_309.z) == vec2<u32>(5u, 5u)))) {
    param_3 = (block_pos_1 + vec3<u32>(0u, 1u, 1u));
    let x_319 : u32 = compute_block_id_vu3_(&(param_3));
    edge_2 = x_319;
    let x_320 : u32 = edge_2;
    let x_322 : u32 = x_255.block_active[x_320];
    if ((x_322 == 0u)) {
      block_dims_3.y = vec2<u32>(4u, 4u).x;
      block_dims_3.z = vec2<u32>(4u, 4u).y;
    }
  }
  let x_331 : u32 = block_dims_3.x;
  if ((x_331 == 5u)) {
    param_4 = (block_pos_1 + vec3<u32>(1u, 0u, 0u));
    let x_339 : u32 = compute_block_id_vu3_(&(param_4));
    face = x_339;
    let x_340 : u32 = face;
    let x_342 : u32 = x_255.block_active[x_340];
    if ((x_342 == 0u)) {
      block_dims_3.x = 4u;
    }
  }
  let x_348 : u32 = block_dims_3.y;
  if ((x_348 == 5u)) {
    param_5 = (block_pos_1 + vec3<u32>(0u, 1u, 0u));
    let x_356 : u32 = compute_block_id_vu3_(&(param_5));
    face_1 = x_356;
    let x_357 : u32 = face_1;
    let x_359 : u32 = x_255.block_active[x_357];
    if ((x_359 == 0u)) {
      block_dims_3.y = 4u;
    }
  }
  let x_365 : u32 = block_dims_3.z;
  if ((x_365 == 5u)) {
    param_6 = (block_pos_1 + vec3<u32>(0u, 0u, 1u));
    let x_373 : u32 = compute_block_id_vu3_(&(param_6));
    face_2 = x_373;
    let x_374 : u32 = face_2;
    let x_376 : u32 = x_255.block_active[x_374];
    if ((x_376 == 0u)) {
      block_dims_3.z = 4u;
    }
  }
  let x_381 : vec3<u32> = block_dims_3;
  return x_381;
}

fn voxel_id_to_voxel_u1_(id_1 : ptr<function, u32>) -> vec3<u32> {
  let x_109 : u32 = *(id_1);
  let x_111 : u32 = *(id_1);
  let x_114 : u32 = *(id_1);
  return vec3<u32>((x_109 % 4u), ((x_111 / 4u) % 4u), (x_114 / 16u));
}

fn compute_voxel_id_vu3_vu3_(voxel_pos : ptr<function, vec3<u32>>, block_dims : ptr<function, vec3<u32>>) -> u32 {
  let x_121 : u32 = (*(voxel_pos)).x;
  let x_123 : u32 = (*(block_dims)).x;
  let x_125 : u32 = (*(voxel_pos)).y;
  let x_127 : u32 = (*(block_dims)).y;
  let x_129 : u32 = (*(voxel_pos)).z;
  return (x_121 + (x_123 * (x_125 + (x_127 * x_129))));
}

fn load_voxel_u1_vu3_vu3_vu3_(neighbor_id : u32, ghost_voxel_pos : vec3<u32>, neighbor_voxel_pos : vec3<u32>, block_dims_2 : vec3<u32>) {
  var neighbor_location : u32;
  var ghost_voxel_id : u32;
  var param_7 : vec3<u32>;
  var param_8 : vec3<u32>;
  var neighbor_voxel_id : u32;
  var param_9 : vec3<u32>;
  var param_10 : vec3<u32>;
  let x_390 : u32 = x_388.block_locations[neighbor_id];
  neighbor_location = x_390;
  param_7 = ghost_voxel_pos;
  param_8 = block_dims_2;
  let x_394 : u32 = compute_voxel_id_vu3_vu3_(&(param_7), &(param_8));
  ghost_voxel_id = x_394;
  param_9 = neighbor_voxel_pos;
  param_10 = vec3<u32>(4u, 4u, 4u);
  let x_398 : u32 = compute_voxel_id_vu3_vu3_(&(param_9), &(param_10));
  neighbor_voxel_id = x_398;
  let x_399 : u32 = ghost_voxel_id;
  let x_404 : u32 = neighbor_location;
  let x_407 : u32 = neighbor_voxel_id;
  let x_411 : f32 = x_403.decompressed[((x_404 * 64u) + x_407)];
  volume_block[x_399] = x_411;
  return;
}

fn load_block_u1_(block_id : u32) -> vec3<u32> {
  var block_pos_2 : vec3<u32>;
  var param_11 : u32;
  var n_blocks_3 : vec3<u32>;
  var block_dims_4 : vec3<u32>;
  var voxel_pos_2 : vec3<u32>;
  var param_12 : u32;
  var i_1 : u32;
  var ghost_voxel_pos_1 : vec3<u32>;
  var indexable_1 : array<vec3<u32>, 3u>;
  var neighbor_voxel_pos_1 : vec3<u32>;
  var indexable_2 : array<vec3<u32>, 3u>;
  var indexable_3 : array<vec3<u32>, 3u>;
  var neighbor_block_pos : vec3<u32>;
  var indexable_4 : array<vec3<u32>, 3u>;
  var neighbor_id_1 : u32;
  var param_13 : vec3<u32>;
  var i_2 : u32;
  var b : vec3<u32>;
  var indexable_5 : array<vec3<u32>, 3u>;
  var p : vec3<u32>;
  var indexable_6 : array<vec3<u32>, 3u>;
  var ghost_voxel_pos_2 : vec3<u32>;
  var indexable_7 : array<vec3<u32>, 3u>;
  var neighbor_voxel_pos_2 : vec3<u32>;
  var indexable_8 : array<vec3<u32>, 3u>;
  var indexable_9 : array<vec3<u32>, 3u>;
  var indexable_10 : array<vec3<u32>, 3u>;
  var neighbor_block_pos_1 : vec3<u32>;
  var indexable_11 : array<vec3<u32>, 3u>;
  var neighbor_id_2 : u32;
  var param_14 : vec3<u32>;
  var ghost_voxel_pos_3 : vec3<u32>;
  var neighbor_block_pos_2 : vec3<u32>;
  var neighbor_id_3 : u32;
  var param_15 : vec3<u32>;
  let x_417 : u32 = gl_LocalInvocationID.x;
  volume_block[(x_417 * 2u)] = 0.0f;
  let x_422 : u32 = gl_LocalInvocationID.x;
  volume_block[((x_422 * 2u) + 1u)] = 0.0f;
  let x_430 : u32 = gl_LocalInvocationID.x;
  voxel_vertices[x_430] = 0u;
  workgroupBarrier();
  param_11 = block_id;
  let x_436 : vec3<u32> = block_id_to_pos_u1_(&(param_11));
  block_pos_2 = x_436;
  let x_439 : vec4<u32> = x_54.padded_dims;
  n_blocks_3 = (vec3<u32>(x_439.x, x_439.y, x_439.z) / vec3<u32>(4u, 4u, 4u));
  let x_443 : vec3<u32> = block_pos_2;
  let x_444 : vec3<u32> = compute_block_dims_with_ghost_vu3_(x_443);
  block_dims_4 = x_444;
  let x_448 : u32 = gl_LocalInvocationID.x;
  param_12 = x_448;
  let x_449 : vec3<u32> = voxel_id_to_voxel_u1_(&(param_12));
  voxel_pos_2 = x_449;
  let x_450 : vec3<u32> = voxel_pos_2;
  let x_451 : vec3<u32> = voxel_pos_2;
  let x_452 : vec3<u32> = block_dims_4;
  load_voxel_u1_vu3_vu3_vu3_(block_id, x_450, x_451, x_452);
  i_1 = 0u;
  loop {
    var x_472 : bool;
    var x_473 : bool;
    let x_460 : u32 = i_1;
    if ((x_460 < 3u)) {
    } else {
      break;
    }
    let x_463 : u32 = i_1;
    let x_465 : u32 = block_dims_4[x_463];
    let x_466 : bool = (x_465 == 5u);
    x_473 = x_466;
    if (x_466) {
      let x_469 : u32 = i_1;
      let x_471 : u32 = voxel_pos_2[x_469];
      x_472 = (x_471 == 3u);
      x_473 = x_472;
    }
    if (x_473) {
      let x_477 : vec3<u32> = voxel_pos_2;
      let x_480 : u32 = i_1;
      indexable_1 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_484 : vec3<u32> = indexable_1[x_480];
      ghost_voxel_pos_1 = (x_477 + x_484);
      let x_487 : vec3<u32> = ghost_voxel_pos_1;
      neighbor_voxel_pos_1 = x_487;
      let x_488 : u32 = i_1;
      indexable_2 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_491 : u32 = indexable_2[x_488].x;
      if ((x_491 == 1u)) {
        neighbor_voxel_pos_1.x = 0u;
      } else {
        let x_497 : u32 = i_1;
        indexable_3 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
        let x_500 : u32 = indexable_3[x_497].y;
        if ((x_500 == 1u)) {
          neighbor_voxel_pos_1.y = 0u;
        } else {
          neighbor_voxel_pos_1.z = 0u;
        }
      }
      let x_508 : vec3<u32> = block_pos_2;
      let x_509 : u32 = i_1;
      indexable_4 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_512 : vec3<u32> = indexable_4[x_509];
      neighbor_block_pos = (x_508 + x_512);
      let x_516 : vec3<u32> = neighbor_block_pos;
      param_13 = x_516;
      let x_517 : u32 = compute_block_id_vu3_(&(param_13));
      neighbor_id_1 = x_517;
      let x_518 : u32 = neighbor_id_1;
      let x_519 : vec3<u32> = ghost_voxel_pos_1;
      let x_520 : vec3<u32> = neighbor_voxel_pos_1;
      let x_521 : vec3<u32> = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_518, x_519, x_520, x_521);
    }

    continuing {
      let x_523 : u32 = i_1;
      i_1 = (x_523 + bitcast<u32>(1i));
    }
  }
  i_2 = 0u;
  loop {
    var x_569 : bool;
    var x_570 : bool;
    let x_531 : u32 = i_2;
    if ((x_531 < 3u)) {
    } else {
      break;
    }
    let x_534 : vec3<u32> = block_dims_4;
    let x_536 : u32 = i_2;
    indexable_5 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
    let x_539 : vec3<u32> = indexable_5[x_536];
    b = (x_534 * x_539);
    let x_542 : vec3<u32> = voxel_pos_2;
    let x_543 : u32 = i_2;
    indexable_6 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
    let x_546 : vec3<u32> = indexable_6[x_543];
    p = (x_542 * x_546);
    let x_549 : u32 = b.x;
    let x_551 : u32 = b.y;
    let x_554 : u32 = b.z;
    let x_557 : bool = (((x_549 + x_551) + x_554) == 10u);
    x_570 = x_557;
    if (x_557) {
      let x_561 : u32 = p.x;
      let x_563 : u32 = p.y;
      let x_566 : u32 = p.z;
      x_569 = (((x_561 + x_563) + x_566) == 6u);
      x_570 = x_569;
    }
    if (x_570) {
      let x_574 : vec3<u32> = voxel_pos_2;
      let x_575 : u32 = i_2;
      indexable_7 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_578 : vec3<u32> = indexable_7[x_575];
      ghost_voxel_pos_2 = (x_574 + x_578);
      let x_581 : vec3<u32> = ghost_voxel_pos_2;
      neighbor_voxel_pos_2 = x_581;
      let x_582 : u32 = i_2;
      indexable_8 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_585 : u32 = indexable_8[x_582].x;
      if ((x_585 == 1u)) {
        neighbor_voxel_pos_2.x = 0u;
      }
      let x_590 : u32 = i_2;
      indexable_9 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_593 : u32 = indexable_9[x_590].y;
      if ((x_593 == 1u)) {
        neighbor_voxel_pos_2.y = 0u;
      }
      let x_598 : u32 = i_2;
      indexable_10 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_601 : u32 = indexable_10[x_598].z;
      if ((x_601 == 1u)) {
        neighbor_voxel_pos_2.z = 0u;
      }
      let x_607 : vec3<u32> = block_pos_2;
      let x_608 : u32 = i_2;
      indexable_11 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_611 : vec3<u32> = indexable_11[x_608];
      neighbor_block_pos_1 = (x_607 + x_611);
      let x_615 : vec3<u32> = neighbor_block_pos_1;
      param_14 = x_615;
      let x_616 : u32 = compute_block_id_vu3_(&(param_14));
      neighbor_id_2 = x_616;
      let x_617 : u32 = neighbor_id_2;
      let x_618 : vec3<u32> = ghost_voxel_pos_2;
      let x_619 : vec3<u32> = neighbor_voxel_pos_2;
      let x_620 : vec3<u32> = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_617, x_618, x_619, x_620);
    }

    continuing {
      let x_622 : u32 = i_2;
      i_2 = (x_622 + bitcast<u32>(1i));
    }
  }
  let x_624 : vec3<u32> = block_dims_4;
  let x_627 : vec3<u32> = voxel_pos_2;
  if ((all((x_624 == vec3<u32>(5u, 5u, 5u))) & all((x_627 == vec3<u32>(3u, 3u, 3u))))) {
    let x_635 : vec3<u32> = voxel_pos_2;
    ghost_voxel_pos_3 = (x_635 + vec3<u32>(1u, 1u, 1u));
    let x_638 : vec3<u32> = block_pos_2;
    neighbor_block_pos_2 = (x_638 + vec3<u32>(1u, 1u, 1u));
    let x_642 : vec3<u32> = neighbor_block_pos_2;
    param_15 = x_642;
    let x_643 : u32 = compute_block_id_vu3_(&(param_15));
    neighbor_id_3 = x_643;
    let x_644 : u32 = neighbor_id_3;
    let x_645 : vec3<u32> = ghost_voxel_pos_3;
    let x_647 : vec3<u32> = block_dims_4;
    load_voxel_u1_vu3_vu3_vu3_(x_644, x_645, vec3<u32>(0u, 0u, 0u), x_647);
  }
  workgroupBarrier();
  let x_649 : vec3<u32> = block_dims_4;
  return x_649;
}

fn compute_vertex_values_vu3_vu3_(voxel_pos_1 : ptr<function, vec3<u32>>, block_dims_1 : ptr<function, vec3<u32>>) -> array<f32, 8u> {
  var i : i32;
  var v : vec3<u32>;
  var indexable : array<vec3<i32>, 8u>;
  var voxel : u32;
  var values : array<f32, 8u>;
  i = 0i;
  loop {
    let x_144 : i32 = i;
    if ((x_144 < 8i)) {
    } else {
      break;
    }
    let x_160 : i32 = i;
    indexable = array<vec3<i32>, 8u>(vec3<i32>(0i, 0i, 0i), vec3<i32>(1i, 0i, 0i), vec3<i32>(1i, 1i, 0i), vec3<i32>(0i, 1i, 0i), vec3<i32>(0i, 0i, 1i), vec3<i32>(1i, 0i, 1i), vec3<i32>(1i, 1i, 1i), vec3<i32>(0i, 1i, 1i));
    let x_165 : vec3<i32> = indexable[x_160];
    v = bitcast<vec3<u32>>(x_165);
    let x_169 : u32 = (*(voxel_pos_1)).z;
    let x_171 : u32 = v.z;
    let x_174 : u32 = (*(block_dims_1)).y;
    let x_177 : u32 = (*(voxel_pos_1)).y;
    let x_180 : u32 = v.y;
    let x_183 : u32 = (*(block_dims_1)).x;
    let x_186 : u32 = (*(voxel_pos_1)).x;
    let x_189 : u32 = v.x;
    voxel = (((((((x_169 + x_171) * x_174) + x_177) + x_180) * x_183) + x_186) + x_189);
    let x_193 : i32 = i;
    let x_198 : u32 = voxel;
    let x_201 : f32 = volume_block[x_198];
    values[x_193] = x_201;

    continuing {
      let x_204 : i32 = i;
      i = (x_204 + 1i);
    }
  }
  let x_206 : array<f32, 8u> = values;
  return x_206;
}

fn main_1() {
  var work_item : u32;
  var block_id_1 : u32;
  var block_dims_5 : vec3<u32>;
  var voxel_pos_3 : vec3<u32>;
  var param_16 : u32;
  var nverts : u32;
  var values_1 : array<f32, 8u>;
  var param_17 : vec3<u32>;
  var param_18 : vec3<u32>;
  var case_index : u32;
  var i_3 : i32;
  var chunk : u32;
  var table_chunk : vec4<i32>;
  var t : u32;
  var i_4 : i32;
  let x_655 : u32 = gl_WorkGroupID.x;
  let x_660 : u32 = x_658.block_id_offset;
  work_item = (x_655 + x_660);
  let x_667 : u32 = work_item;
  let x_669 : u32 = x_666.block_ids[x_667];
  block_id_1 = x_669;
  let x_671 : u32 = block_id_1;
  let x_672 : vec3<u32> = load_block_u1_(x_671);
  block_dims_5 = x_672;
  let x_676 : u32 = gl_LocalInvocationID.x;
  param_16 = x_676;
  let x_677 : vec3<u32> = voxel_id_to_voxel_u1_(&(param_16));
  voxel_pos_3 = x_677;
  nverts = 0u;
  let x_679 : vec3<u32> = voxel_pos_3;
  let x_681 : vec3<u32> = block_dims_5;
  if (all(((x_679 + vec3<u32>(1u, 1u, 1u)) < x_681))) {
    let x_688 : vec3<u32> = voxel_pos_3;
    param_17 = x_688;
    let x_690 : vec3<u32> = block_dims_5;
    param_18 = x_690;
    let x_691 : array<f32, 8u> = compute_vertex_values_vu3_vu3_(&(param_17), &(param_18));
    values_1 = x_691;
    case_index = 0u;
    i_3 = 0i;
    loop {
      let x_699 : i32 = i_3;
      if ((x_699 < 8i)) {
      } else {
        break;
      }
      let x_701 : i32 = i_3;
      let x_703 : f32 = values_1[x_701];
      let x_706 : f32 = x_54.isovalue;
      if ((x_703 <= x_706)) {
        let x_710 : i32 = i_3;
        let x_713 : u32 = case_index;
        case_index = (x_713 | bitcast<u32>((1i << bitcast<u32>(x_710))));
      }

      continuing {
        let x_715 : i32 = i_3;
        i_3 = (x_715 + 1i);
      }
    }
    let x_718 : u32 = case_index;
    chunk = (x_718 * 4u);
    let x_728 : u32 = chunk;
    let x_731 : vec4<i32> = x_727.tri_table[x_728];
    table_chunk = x_731;
    t = 0u;
    loop {
      let x_738 : u32 = t;
      let x_740 : i32 = table_chunk[x_738];
      if ((x_740 != -1i)) {
      } else {
        break;
      }
      let x_743 : u32 = nverts;
      nverts = (x_743 + bitcast<u32>(1i));
      let x_745 : u32 = t;
      if ((x_745 == 3u)) {
        let x_749 : u32 = chunk;
        let x_750 : u32 = (x_749 + bitcast<u32>(1i));
        chunk = x_750;
        let x_752 : vec4<i32> = x_727.tri_table[x_750];
        table_chunk = x_752;
        t = 0u;
      } else {
        let x_754 : u32 = t;
        t = (x_754 + bitcast<u32>(1i));
      }
    }
  }
  let x_757 : u32 = gl_LocalInvocationID.x;
  let x_758 : u32 = nverts;
  voxel_vertices[x_757] = x_758;
  workgroupBarrier();
  let x_761 : u32 = gl_LocalInvocationID.x;
  if ((x_761 == 0u)) {
    let x_769 : u32 = work_item;
    x_768.block_has_vertices[x_769] = 0u;
    i_4 = 0i;
    loop {
      let x_777 : i32 = i_4;
      if ((x_777 < 64i)) {
      } else {
        break;
      }
      let x_780 : i32 = i_4;
      let x_782 : u32 = voxel_vertices[x_780];
      if ((x_782 > 0u)) {
        let x_786 : u32 = work_item;
        x_768.block_has_vertices[x_786] = 1u;
        break;
      }

      continuing {
        let x_789 : i32 = i_4;
        i_4 = (x_789 + 1i);
      }
    }
  }
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(local_invocation_id) gl_LocalInvocationID_param : vec3<u32>, @builtin(workgroup_id) gl_WorkGroupID_param : vec3<u32>) {
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  gl_WorkGroupID = gl_WorkGroupID_param;
  main_1();
}
`;

const compute_block_voxel_num_verts_comp_spv = `struct VolumeParams {
  volume_dims : vec4<u32>,
  padded_dims : vec4<u32>,
  volume_scale : vec4<f32>,
  max_bits : u32,
  isovalue : f32,
}

type RTArr = array<u32>;

type RTArr_1 = array<u32>;

struct BlockActive {
  block_active : RTArr_1,
}

type RTArr_2 = array<u32>;

struct BlockLocations {
  block_locations : RTArr_1,
}

type RTArr_3 = array<f32>;

struct Decompressed {
  decompressed : RTArr_3,
}

type RTArr_4 = array<u32>;

struct BlockIDs {
  block_ids : RTArr_1,
}

type RTArr_5 = array<u32>;

struct BlockWithVertsIndices {
  block_with_verts_indices : RTArr_1,
}

struct BlockIndexOffset {
  block_index_offset : u32,
}

type Arr = array<vec4<i32>, 1024u>;

struct TriTable {
  tri_table : Arr,
}

struct BlockOffsets {
  block_offsets : RTArr_1,
}

@group(0) @binding(0) var<uniform> x_54 : VolumeParams;

var<workgroup> volume_block : array<f32, 128u>;

@group(0) @binding(3) var<storage, read_write> x_255 : BlockActive;

@group(0) @binding(4) var<storage, read_write> x_388 : BlockLocations;

@group(0) @binding(2) var<storage, read_write> x_403 : Decompressed;

var<private> gl_LocalInvocationID : vec3<u32>;

var<workgroup> voxel_vertices : array<u32, 64u>;

@group(0) @binding(5) var<storage, read_write> x_656 : BlockIDs;

@group(1) @binding(1) var<storage, read_write> x_660 : BlockWithVertsIndices;

var<private> gl_WorkGroupID : vec3<u32>;

@group(2) @binding(0) var<uniform> x_666 : BlockIndexOffset;

@group(0) @binding(1) var<uniform> x_731 : TriTable;

@group(1) @binding(0) var<storage, read_write> x_821 : BlockOffsets;

fn block_id_to_pos_u1_(id : ptr<function, u32>) -> vec3<u32> {
  var n_blocks : vec3<u32>;
  let x_59 : vec4<u32> = x_54.padded_dims;
  n_blocks = (vec3<u32>(x_59.x, x_59.y, x_59.z) / vec3<u32>(4u, 4u, 4u));
  let x_64 : u32 = *(id);
  let x_67 : u32 = n_blocks.x;
  let x_69 : u32 = *(id);
  let x_71 : u32 = n_blocks.x;
  let x_75 : u32 = n_blocks.y;
  let x_77 : u32 = *(id);
  let x_79 : u32 = n_blocks.x;
  let x_81 : u32 = n_blocks.y;
  return vec3<u32>((x_64 % x_67), ((x_69 / x_71) % x_75), (x_77 / (x_79 * x_81)));
}

fn compute_block_id_vu3_(block_pos : ptr<function, vec3<u32>>) -> u32 {
  var n_blocks_1 : vec3<u32>;
  let x_89 : vec4<u32> = x_54.padded_dims;
  n_blocks_1 = (vec3<u32>(x_89.x, x_89.y, x_89.z) / vec3<u32>(4u, 4u, 4u));
  let x_93 : u32 = (*(block_pos)).x;
  let x_95 : u32 = n_blocks_1.x;
  let x_97 : u32 = (*(block_pos)).y;
  let x_99 : u32 = n_blocks_1.y;
  let x_102 : u32 = (*(block_pos)).z;
  return (x_93 + (x_95 * (x_97 + (x_99 * x_102))));
}

fn compute_block_dims_with_ghost_vu3_(block_pos_1 : vec3<u32>) -> vec3<u32> {
  var n_blocks_2 : vec3<u32>;
  var block_dims_3 : vec3<u32>;
  var corner : u32;
  var param : vec3<u32>;
  var edge : u32;
  var param_1 : vec3<u32>;
  var edge_1 : u32;
  var param_2 : vec3<u32>;
  var edge_2 : u32;
  var param_3 : vec3<u32>;
  var face : u32;
  var param_4 : vec3<u32>;
  var face_1 : u32;
  var param_5 : vec3<u32>;
  var face_2 : u32;
  var param_6 : vec3<u32>;
  let x_211 : vec4<u32> = x_54.padded_dims;
  n_blocks_2 = (vec3<u32>(x_211.x, x_211.y, x_211.z) / vec3<u32>(4u, 4u, 4u));
  block_dims_3 = vec3<u32>(4u, 4u, 4u);
  let x_218 : u32 = n_blocks_2.x;
  if (((block_pos_1.x + 1u) < x_218)) {
    block_dims_3.x = 5u;
  }
  let x_227 : u32 = n_blocks_2.y;
  if (((block_pos_1.y + 1u) < x_227)) {
    block_dims_3.y = 5u;
  }
  let x_235 : u32 = n_blocks_2.z;
  if (((block_pos_1.z + 1u) < x_235)) {
    block_dims_3.z = 5u;
  }
  let x_240 : vec3<u32> = block_dims_3;
  if (all((x_240 == vec3<u32>(5u, 5u, 5u)))) {
    param = (block_pos_1 + vec3<u32>(1u, 1u, 1u));
    let x_251 : u32 = compute_block_id_vu3_(&(param));
    corner = x_251;
    let x_256 : u32 = corner;
    let x_259 : u32 = x_255.block_active[x_256];
    if ((x_259 == 0u)) {
      block_dims_3 = vec3<u32>(4u, 4u, 4u);
    }
  }
  let x_264 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_264.x, x_264.y) == vec2<u32>(5u, 5u)))) {
    param_1 = (block_pos_1 + vec3<u32>(1u, 1u, 0u));
    let x_276 : u32 = compute_block_id_vu3_(&(param_1));
    edge = x_276;
    let x_277 : u32 = edge;
    let x_279 : u32 = x_255.block_active[x_277];
    if ((x_279 == 0u)) {
      block_dims_3.x = vec2<u32>(4u, 4u).x;
      block_dims_3.y = vec2<u32>(4u, 4u).y;
    }
  }
  let x_288 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_288.x, x_288.z) == vec2<u32>(5u, 5u)))) {
    param_2 = (block_pos_1 + vec3<u32>(1u, 0u, 1u));
    let x_298 : u32 = compute_block_id_vu3_(&(param_2));
    edge_1 = x_298;
    let x_299 : u32 = edge_1;
    let x_301 : u32 = x_255.block_active[x_299];
    if ((x_301 == 0u)) {
      block_dims_3.x = vec2<u32>(4u, 4u).x;
      block_dims_3.z = vec2<u32>(4u, 4u).y;
    }
  }
  let x_309 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_309.y, x_309.z) == vec2<u32>(5u, 5u)))) {
    param_3 = (block_pos_1 + vec3<u32>(0u, 1u, 1u));
    let x_319 : u32 = compute_block_id_vu3_(&(param_3));
    edge_2 = x_319;
    let x_320 : u32 = edge_2;
    let x_322 : u32 = x_255.block_active[x_320];
    if ((x_322 == 0u)) {
      block_dims_3.y = vec2<u32>(4u, 4u).x;
      block_dims_3.z = vec2<u32>(4u, 4u).y;
    }
  }
  let x_331 : u32 = block_dims_3.x;
  if ((x_331 == 5u)) {
    param_4 = (block_pos_1 + vec3<u32>(1u, 0u, 0u));
    let x_339 : u32 = compute_block_id_vu3_(&(param_4));
    face = x_339;
    let x_340 : u32 = face;
    let x_342 : u32 = x_255.block_active[x_340];
    if ((x_342 == 0u)) {
      block_dims_3.x = 4u;
    }
  }
  let x_348 : u32 = block_dims_3.y;
  if ((x_348 == 5u)) {
    param_5 = (block_pos_1 + vec3<u32>(0u, 1u, 0u));
    let x_356 : u32 = compute_block_id_vu3_(&(param_5));
    face_1 = x_356;
    let x_357 : u32 = face_1;
    let x_359 : u32 = x_255.block_active[x_357];
    if ((x_359 == 0u)) {
      block_dims_3.y = 4u;
    }
  }
  let x_365 : u32 = block_dims_3.z;
  if ((x_365 == 5u)) {
    param_6 = (block_pos_1 + vec3<u32>(0u, 0u, 1u));
    let x_373 : u32 = compute_block_id_vu3_(&(param_6));
    face_2 = x_373;
    let x_374 : u32 = face_2;
    let x_376 : u32 = x_255.block_active[x_374];
    if ((x_376 == 0u)) {
      block_dims_3.z = 4u;
    }
  }
  let x_381 : vec3<u32> = block_dims_3;
  return x_381;
}

fn voxel_id_to_voxel_u1_(id_1 : ptr<function, u32>) -> vec3<u32> {
  let x_109 : u32 = *(id_1);
  let x_111 : u32 = *(id_1);
  let x_114 : u32 = *(id_1);
  return vec3<u32>((x_109 % 4u), ((x_111 / 4u) % 4u), (x_114 / 16u));
}

fn compute_voxel_id_vu3_vu3_(voxel_pos : ptr<function, vec3<u32>>, block_dims : ptr<function, vec3<u32>>) -> u32 {
  let x_121 : u32 = (*(voxel_pos)).x;
  let x_123 : u32 = (*(block_dims)).x;
  let x_125 : u32 = (*(voxel_pos)).y;
  let x_127 : u32 = (*(block_dims)).y;
  let x_129 : u32 = (*(voxel_pos)).z;
  return (x_121 + (x_123 * (x_125 + (x_127 * x_129))));
}

fn load_voxel_u1_vu3_vu3_vu3_(neighbor_id : u32, ghost_voxel_pos : vec3<u32>, neighbor_voxel_pos : vec3<u32>, block_dims_2 : vec3<u32>) {
  var neighbor_location : u32;
  var ghost_voxel_id : u32;
  var param_7 : vec3<u32>;
  var param_8 : vec3<u32>;
  var neighbor_voxel_id : u32;
  var param_9 : vec3<u32>;
  var param_10 : vec3<u32>;
  let x_390 : u32 = x_388.block_locations[neighbor_id];
  neighbor_location = x_390;
  param_7 = ghost_voxel_pos;
  param_8 = block_dims_2;
  let x_394 : u32 = compute_voxel_id_vu3_vu3_(&(param_7), &(param_8));
  ghost_voxel_id = x_394;
  param_9 = neighbor_voxel_pos;
  param_10 = vec3<u32>(4u, 4u, 4u);
  let x_398 : u32 = compute_voxel_id_vu3_vu3_(&(param_9), &(param_10));
  neighbor_voxel_id = x_398;
  let x_399 : u32 = ghost_voxel_id;
  let x_404 : u32 = neighbor_location;
  let x_407 : u32 = neighbor_voxel_id;
  let x_411 : f32 = x_403.decompressed[((x_404 * 64u) + x_407)];
  volume_block[x_399] = x_411;
  return;
}

fn load_block_u1_(block_id : u32) -> vec3<u32> {
  var block_pos_2 : vec3<u32>;
  var param_11 : u32;
  var n_blocks_3 : vec3<u32>;
  var block_dims_4 : vec3<u32>;
  var voxel_pos_2 : vec3<u32>;
  var param_12 : u32;
  var i_1 : u32;
  var ghost_voxel_pos_1 : vec3<u32>;
  var indexable_1 : array<vec3<u32>, 3u>;
  var neighbor_voxel_pos_1 : vec3<u32>;
  var indexable_2 : array<vec3<u32>, 3u>;
  var indexable_3 : array<vec3<u32>, 3u>;
  var neighbor_block_pos : vec3<u32>;
  var indexable_4 : array<vec3<u32>, 3u>;
  var neighbor_id_1 : u32;
  var param_13 : vec3<u32>;
  var i_2 : u32;
  var b : vec3<u32>;
  var indexable_5 : array<vec3<u32>, 3u>;
  var p : vec3<u32>;
  var indexable_6 : array<vec3<u32>, 3u>;
  var ghost_voxel_pos_2 : vec3<u32>;
  var indexable_7 : array<vec3<u32>, 3u>;
  var neighbor_voxel_pos_2 : vec3<u32>;
  var indexable_8 : array<vec3<u32>, 3u>;
  var indexable_9 : array<vec3<u32>, 3u>;
  var indexable_10 : array<vec3<u32>, 3u>;
  var neighbor_block_pos_1 : vec3<u32>;
  var indexable_11 : array<vec3<u32>, 3u>;
  var neighbor_id_2 : u32;
  var param_14 : vec3<u32>;
  var ghost_voxel_pos_3 : vec3<u32>;
  var neighbor_block_pos_2 : vec3<u32>;
  var neighbor_id_3 : u32;
  var param_15 : vec3<u32>;
  let x_417 : u32 = gl_LocalInvocationID.x;
  volume_block[(x_417 * 2u)] = 0.0f;
  let x_422 : u32 = gl_LocalInvocationID.x;
  volume_block[((x_422 * 2u) + 1u)] = 0.0f;
  let x_430 : u32 = gl_LocalInvocationID.x;
  voxel_vertices[x_430] = 0u;
  workgroupBarrier();
  param_11 = block_id;
  let x_436 : vec3<u32> = block_id_to_pos_u1_(&(param_11));
  block_pos_2 = x_436;
  let x_439 : vec4<u32> = x_54.padded_dims;
  n_blocks_3 = (vec3<u32>(x_439.x, x_439.y, x_439.z) / vec3<u32>(4u, 4u, 4u));
  let x_443 : vec3<u32> = block_pos_2;
  let x_444 : vec3<u32> = compute_block_dims_with_ghost_vu3_(x_443);
  block_dims_4 = x_444;
  let x_448 : u32 = gl_LocalInvocationID.x;
  param_12 = x_448;
  let x_449 : vec3<u32> = voxel_id_to_voxel_u1_(&(param_12));
  voxel_pos_2 = x_449;
  let x_450 : vec3<u32> = voxel_pos_2;
  let x_451 : vec3<u32> = voxel_pos_2;
  let x_452 : vec3<u32> = block_dims_4;
  load_voxel_u1_vu3_vu3_vu3_(block_id, x_450, x_451, x_452);
  i_1 = 0u;
  loop {
    var x_472 : bool;
    var x_473 : bool;
    let x_460 : u32 = i_1;
    if ((x_460 < 3u)) {
    } else {
      break;
    }
    let x_463 : u32 = i_1;
    let x_465 : u32 = block_dims_4[x_463];
    let x_466 : bool = (x_465 == 5u);
    x_473 = x_466;
    if (x_466) {
      let x_469 : u32 = i_1;
      let x_471 : u32 = voxel_pos_2[x_469];
      x_472 = (x_471 == 3u);
      x_473 = x_472;
    }
    if (x_473) {
      let x_477 : vec3<u32> = voxel_pos_2;
      let x_480 : u32 = i_1;
      indexable_1 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_484 : vec3<u32> = indexable_1[x_480];
      ghost_voxel_pos_1 = (x_477 + x_484);
      let x_487 : vec3<u32> = ghost_voxel_pos_1;
      neighbor_voxel_pos_1 = x_487;
      let x_488 : u32 = i_1;
      indexable_2 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_491 : u32 = indexable_2[x_488].x;
      if ((x_491 == 1u)) {
        neighbor_voxel_pos_1.x = 0u;
      } else {
        let x_497 : u32 = i_1;
        indexable_3 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
        let x_500 : u32 = indexable_3[x_497].y;
        if ((x_500 == 1u)) {
          neighbor_voxel_pos_1.y = 0u;
        } else {
          neighbor_voxel_pos_1.z = 0u;
        }
      }
      let x_508 : vec3<u32> = block_pos_2;
      let x_509 : u32 = i_1;
      indexable_4 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_512 : vec3<u32> = indexable_4[x_509];
      neighbor_block_pos = (x_508 + x_512);
      let x_516 : vec3<u32> = neighbor_block_pos;
      param_13 = x_516;
      let x_517 : u32 = compute_block_id_vu3_(&(param_13));
      neighbor_id_1 = x_517;
      let x_518 : u32 = neighbor_id_1;
      let x_519 : vec3<u32> = ghost_voxel_pos_1;
      let x_520 : vec3<u32> = neighbor_voxel_pos_1;
      let x_521 : vec3<u32> = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_518, x_519, x_520, x_521);
    }

    continuing {
      let x_523 : u32 = i_1;
      i_1 = (x_523 + bitcast<u32>(1i));
    }
  }
  i_2 = 0u;
  loop {
    var x_569 : bool;
    var x_570 : bool;
    let x_531 : u32 = i_2;
    if ((x_531 < 3u)) {
    } else {
      break;
    }
    let x_534 : vec3<u32> = block_dims_4;
    let x_536 : u32 = i_2;
    indexable_5 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
    let x_539 : vec3<u32> = indexable_5[x_536];
    b = (x_534 * x_539);
    let x_542 : vec3<u32> = voxel_pos_2;
    let x_543 : u32 = i_2;
    indexable_6 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
    let x_546 : vec3<u32> = indexable_6[x_543];
    p = (x_542 * x_546);
    let x_549 : u32 = b.x;
    let x_551 : u32 = b.y;
    let x_554 : u32 = b.z;
    let x_557 : bool = (((x_549 + x_551) + x_554) == 10u);
    x_570 = x_557;
    if (x_557) {
      let x_561 : u32 = p.x;
      let x_563 : u32 = p.y;
      let x_566 : u32 = p.z;
      x_569 = (((x_561 + x_563) + x_566) == 6u);
      x_570 = x_569;
    }
    if (x_570) {
      let x_574 : vec3<u32> = voxel_pos_2;
      let x_575 : u32 = i_2;
      indexable_7 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_578 : vec3<u32> = indexable_7[x_575];
      ghost_voxel_pos_2 = (x_574 + x_578);
      let x_581 : vec3<u32> = ghost_voxel_pos_2;
      neighbor_voxel_pos_2 = x_581;
      let x_582 : u32 = i_2;
      indexable_8 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_585 : u32 = indexable_8[x_582].x;
      if ((x_585 == 1u)) {
        neighbor_voxel_pos_2.x = 0u;
      }
      let x_590 : u32 = i_2;
      indexable_9 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_593 : u32 = indexable_9[x_590].y;
      if ((x_593 == 1u)) {
        neighbor_voxel_pos_2.y = 0u;
      }
      let x_598 : u32 = i_2;
      indexable_10 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_601 : u32 = indexable_10[x_598].z;
      if ((x_601 == 1u)) {
        neighbor_voxel_pos_2.z = 0u;
      }
      let x_607 : vec3<u32> = block_pos_2;
      let x_608 : u32 = i_2;
      indexable_11 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_611 : vec3<u32> = indexable_11[x_608];
      neighbor_block_pos_1 = (x_607 + x_611);
      let x_615 : vec3<u32> = neighbor_block_pos_1;
      param_14 = x_615;
      let x_616 : u32 = compute_block_id_vu3_(&(param_14));
      neighbor_id_2 = x_616;
      let x_617 : u32 = neighbor_id_2;
      let x_618 : vec3<u32> = ghost_voxel_pos_2;
      let x_619 : vec3<u32> = neighbor_voxel_pos_2;
      let x_620 : vec3<u32> = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_617, x_618, x_619, x_620);
    }

    continuing {
      let x_622 : u32 = i_2;
      i_2 = (x_622 + bitcast<u32>(1i));
    }
  }
  let x_624 : vec3<u32> = block_dims_4;
  let x_627 : vec3<u32> = voxel_pos_2;
  if ((all((x_624 == vec3<u32>(5u, 5u, 5u))) & all((x_627 == vec3<u32>(3u, 3u, 3u))))) {
    let x_635 : vec3<u32> = voxel_pos_2;
    ghost_voxel_pos_3 = (x_635 + vec3<u32>(1u, 1u, 1u));
    let x_638 : vec3<u32> = block_pos_2;
    neighbor_block_pos_2 = (x_638 + vec3<u32>(1u, 1u, 1u));
    let x_642 : vec3<u32> = neighbor_block_pos_2;
    param_15 = x_642;
    let x_643 : u32 = compute_block_id_vu3_(&(param_15));
    neighbor_id_3 = x_643;
    let x_644 : u32 = neighbor_id_3;
    let x_645 : vec3<u32> = ghost_voxel_pos_3;
    let x_647 : vec3<u32> = block_dims_4;
    load_voxel_u1_vu3_vu3_vu3_(x_644, x_645, vec3<u32>(0u, 0u, 0u), x_647);
  }
  workgroupBarrier();
  let x_649 : vec3<u32> = block_dims_4;
  return x_649;
}

fn compute_vertex_values_vu3_vu3_(voxel_pos_1 : ptr<function, vec3<u32>>, block_dims_1 : ptr<function, vec3<u32>>) -> array<f32, 8u> {
  var i : i32;
  var v : vec3<u32>;
  var indexable : array<vec3<i32>, 8u>;
  var voxel : u32;
  var values : array<f32, 8u>;
  i = 0i;
  loop {
    let x_144 : i32 = i;
    if ((x_144 < 8i)) {
    } else {
      break;
    }
    let x_160 : i32 = i;
    indexable = array<vec3<i32>, 8u>(vec3<i32>(0i, 0i, 0i), vec3<i32>(1i, 0i, 0i), vec3<i32>(1i, 1i, 0i), vec3<i32>(0i, 1i, 0i), vec3<i32>(0i, 0i, 1i), vec3<i32>(1i, 0i, 1i), vec3<i32>(1i, 1i, 1i), vec3<i32>(0i, 1i, 1i));
    let x_165 : vec3<i32> = indexable[x_160];
    v = bitcast<vec3<u32>>(x_165);
    let x_169 : u32 = (*(voxel_pos_1)).z;
    let x_171 : u32 = v.z;
    let x_174 : u32 = (*(block_dims_1)).y;
    let x_177 : u32 = (*(voxel_pos_1)).y;
    let x_180 : u32 = v.y;
    let x_183 : u32 = (*(block_dims_1)).x;
    let x_186 : u32 = (*(voxel_pos_1)).x;
    let x_189 : u32 = v.x;
    voxel = (((((((x_169 + x_171) * x_174) + x_177) + x_180) * x_183) + x_186) + x_189);
    let x_193 : i32 = i;
    let x_198 : u32 = voxel;
    let x_201 : f32 = volume_block[x_198];
    values[x_193] = x_201;

    continuing {
      let x_204 : i32 = i;
      i = (x_204 + 1i);
    }
  }
  let x_206 : array<f32, 8u> = values;
  return x_206;
}

fn main_1() {
  var block_id_1 : u32;
  var block_dims_5 : vec3<u32>;
  var voxel_pos_3 : vec3<u32>;
  var param_16 : u32;
  var nverts : u32;
  var values_1 : array<f32, 8u>;
  var param_17 : vec3<u32>;
  var param_18 : vec3<u32>;
  var case_index : u32;
  var i_3 : i32;
  var chunk : u32;
  var table_chunk : vec4<i32>;
  var t : u32;
  var offs : u32;
  var d : i32;
  var a : u32;
  var b_1 : u32;
  var block_verts : u32;
  let x_663 : u32 = gl_WorkGroupID.x;
  let x_668 : u32 = x_666.block_index_offset;
  let x_671 : u32 = x_660.block_with_verts_indices[(x_663 + x_668)];
  let x_673 : u32 = x_656.block_ids[x_671];
  block_id_1 = x_673;
  let x_675 : u32 = block_id_1;
  let x_676 : vec3<u32> = load_block_u1_(x_675);
  block_dims_5 = x_676;
  let x_680 : u32 = gl_LocalInvocationID.x;
  param_16 = x_680;
  let x_681 : vec3<u32> = voxel_id_to_voxel_u1_(&(param_16));
  voxel_pos_3 = x_681;
  nverts = 0u;
  let x_683 : vec3<u32> = voxel_pos_3;
  let x_685 : vec3<u32> = block_dims_5;
  if (all(((x_683 + vec3<u32>(1u, 1u, 1u)) < x_685))) {
    let x_692 : vec3<u32> = voxel_pos_3;
    param_17 = x_692;
    let x_694 : vec3<u32> = block_dims_5;
    param_18 = x_694;
    let x_695 : array<f32, 8u> = compute_vertex_values_vu3_vu3_(&(param_17), &(param_18));
    values_1 = x_695;
    case_index = 0u;
    i_3 = 0i;
    loop {
      let x_703 : i32 = i_3;
      if ((x_703 < 8i)) {
      } else {
        break;
      }
      let x_705 : i32 = i_3;
      let x_707 : f32 = values_1[x_705];
      let x_710 : f32 = x_54.isovalue;
      if ((x_707 <= x_710)) {
        let x_714 : i32 = i_3;
        let x_717 : u32 = case_index;
        case_index = (x_717 | bitcast<u32>((1i << bitcast<u32>(x_714))));
      }

      continuing {
        let x_719 : i32 = i_3;
        i_3 = (x_719 + 1i);
      }
    }
    let x_722 : u32 = case_index;
    chunk = (x_722 * 4u);
    let x_732 : u32 = chunk;
    let x_735 : vec4<i32> = x_731.tri_table[x_732];
    table_chunk = x_735;
    t = 0u;
    loop {
      let x_742 : u32 = t;
      let x_744 : i32 = table_chunk[x_742];
      if ((x_744 != -1i)) {
      } else {
        break;
      }
      let x_747 : u32 = nverts;
      nverts = (x_747 + bitcast<u32>(1i));
      let x_749 : u32 = t;
      if ((x_749 == 3u)) {
        let x_753 : u32 = chunk;
        let x_754 : u32 = (x_753 + bitcast<u32>(1i));
        chunk = x_754;
        let x_756 : vec4<i32> = x_731.tri_table[x_754];
        table_chunk = x_756;
        t = 0u;
      } else {
        let x_758 : u32 = t;
        t = (x_758 + bitcast<u32>(1i));
      }
    }
  }
  let x_761 : u32 = gl_LocalInvocationID.x;
  let x_762 : u32 = nverts;
  voxel_vertices[x_761] = x_762;
  offs = 1u;
  d = 32i;
  loop {
    let x_772 : i32 = d;
    if ((x_772 > 0i)) {
    } else {
      break;
    }
    workgroupBarrier();
    let x_775 : u32 = gl_LocalInvocationID.x;
    let x_776 : i32 = d;
    if ((x_775 < bitcast<u32>(x_776))) {
      let x_782 : u32 = offs;
      let x_784 : u32 = gl_LocalInvocationID.x;
      a = ((x_782 * ((2u * x_784) + 1u)) - 1u);
      let x_790 : u32 = offs;
      let x_792 : u32 = gl_LocalInvocationID.x;
      b_1 = ((x_790 * ((2u * x_792) + 2u)) - 1u);
      let x_797 : u32 = b_1;
      let x_798 : u32 = a;
      let x_800 : u32 = voxel_vertices[x_798];
      let x_802 : u32 = voxel_vertices[x_797];
      voxel_vertices[x_797] = (x_802 + x_800);
    }
    let x_805 : u32 = offs;
    offs = (x_805 << bitcast<u32>(1i));

    continuing {
      let x_807 : i32 = d;
      d = (x_807 >> bitcast<u32>(1i));
    }
  }
  let x_810 : u32 = gl_LocalInvocationID.x;
  if ((x_810 == 0u)) {
    let x_817 : u32 = voxel_vertices[63i];
    block_verts = x_817;
    let x_823 : u32 = gl_WorkGroupID.x;
    let x_825 : u32 = x_666.block_index_offset;
    let x_827 : u32 = block_verts;
    x_821.block_offsets[(x_823 + x_825)] = x_827;
  }
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(local_invocation_id) gl_LocalInvocationID_param : vec3<u32>, @builtin(workgroup_id) gl_WorkGroupID_param : vec3<u32>) {
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  gl_WorkGroupID = gl_WorkGroupID_param;
  main_1();
}
`;

const compute_block_vertices_comp_spv = `struct VolumeParams {
  volume_dims : vec4<u32>,
  padded_dims : vec4<u32>,
  volume_scale : vec4<f32>,
  max_bits : u32,
  isovalue : f32,
}

type RTArr = array<u32>;

type RTArr_1 = array<u32>;

struct BlockActive {
  block_active : RTArr_1,
}

type RTArr_2 = array<u32>;

struct BlockLocations {
  block_locations : RTArr_1,
}

type RTArr_3 = array<f32>;

struct Decompressed {
  decompressed : RTArr_3,
}

struct BlockInfo {
  index : u32,
  offset : u32,
}

struct BlockInfo_1 {
  index : u32,
  offset : u32,
}

type RTArr_4 = array<BlockInfo_1>;

struct BlockInformation {
  blocks_with_verts : RTArr_4,
}

struct BlockIDs {
  block_ids : RTArr_1,
}

type Arr = array<vec4<i32>, 1024u>;

struct TriTable {
  tri_table : Arr,
}

type RTArr_5 = array<vec2<u32>>;

struct Vertices {
  verts : RTArr_5,
}

@group(0) @binding(0) var<uniform> x_69 : VolumeParams;

var<workgroup> volume_block : array<f32, 128u>;

@group(0) @binding(3) var<storage, read_write> x_268 : BlockActive;

@group(0) @binding(4) var<storage, read_write> x_401 : BlockLocations;

@group(0) @binding(2) var<storage, read_write> x_416 : Decompressed;

var<private> gl_LocalInvocationID : vec3<u32>;

var<workgroup> voxel_vertices : array<u32, 64u>;

@group(1) @binding(0) var<storage, read_write> x_750 : BlockInformation;

var<private> gl_WorkGroupID : vec3<u32>;

@group(0) @binding(5) var<storage, read_write> x_765 : BlockIDs;

@group(0) @binding(1) var<uniform> x_826 : TriTable;

@group(2) @binding(0) var<storage, read_write> x_1087 : Vertices;

fn block_id_to_pos_u1_(id : ptr<function, u32>) -> vec3<u32> {
  var n_blocks : vec3<u32>;
  let x_73 : vec4<u32> = x_69.padded_dims;
  n_blocks = (vec3<u32>(x_73.x, x_73.y, x_73.z) / vec3<u32>(4u, 4u, 4u));
  let x_78 : u32 = *(id);
  let x_81 : u32 = n_blocks.x;
  let x_83 : u32 = *(id);
  let x_85 : u32 = n_blocks.x;
  let x_89 : u32 = n_blocks.y;
  let x_91 : u32 = *(id);
  let x_93 : u32 = n_blocks.x;
  let x_95 : u32 = n_blocks.y;
  return vec3<u32>((x_78 % x_81), ((x_83 / x_85) % x_89), (x_91 / (x_93 * x_95)));
}

fn compute_block_id_vu3_(block_pos : ptr<function, vec3<u32>>) -> u32 {
  var n_blocks_1 : vec3<u32>;
  let x_103 : vec4<u32> = x_69.padded_dims;
  n_blocks_1 = (vec3<u32>(x_103.x, x_103.y, x_103.z) / vec3<u32>(4u, 4u, 4u));
  let x_107 : u32 = (*(block_pos)).x;
  let x_109 : u32 = n_blocks_1.x;
  let x_111 : u32 = (*(block_pos)).y;
  let x_113 : u32 = n_blocks_1.y;
  let x_116 : u32 = (*(block_pos)).z;
  return (x_107 + (x_109 * (x_111 + (x_113 * x_116))));
}

fn compute_block_dims_with_ghost_vu3_(block_pos_1 : vec3<u32>) -> vec3<u32> {
  var n_blocks_2 : vec3<u32>;
  var block_dims_3 : vec3<u32>;
  var corner : u32;
  var param : vec3<u32>;
  var edge : u32;
  var param_1 : vec3<u32>;
  var edge_1 : u32;
  var param_2 : vec3<u32>;
  var edge_2 : u32;
  var param_3 : vec3<u32>;
  var face : u32;
  var param_4 : vec3<u32>;
  var face_1 : u32;
  var param_5 : vec3<u32>;
  var face_2 : u32;
  var param_6 : vec3<u32>;
  let x_224 : vec4<u32> = x_69.padded_dims;
  n_blocks_2 = (vec3<u32>(x_224.x, x_224.y, x_224.z) / vec3<u32>(4u, 4u, 4u));
  block_dims_3 = vec3<u32>(4u, 4u, 4u);
  let x_231 : u32 = n_blocks_2.x;
  if (((block_pos_1.x + 1u) < x_231)) {
    block_dims_3.x = 5u;
  }
  let x_240 : u32 = n_blocks_2.y;
  if (((block_pos_1.y + 1u) < x_240)) {
    block_dims_3.y = 5u;
  }
  let x_248 : u32 = n_blocks_2.z;
  if (((block_pos_1.z + 1u) < x_248)) {
    block_dims_3.z = 5u;
  }
  let x_253 : vec3<u32> = block_dims_3;
  if (all((x_253 == vec3<u32>(5u, 5u, 5u)))) {
    param = (block_pos_1 + vec3<u32>(1u, 1u, 1u));
    let x_264 : u32 = compute_block_id_vu3_(&(param));
    corner = x_264;
    let x_269 : u32 = corner;
    let x_272 : u32 = x_268.block_active[x_269];
    if ((x_272 == 0u)) {
      block_dims_3 = vec3<u32>(4u, 4u, 4u);
    }
  }
  let x_277 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_277.x, x_277.y) == vec2<u32>(5u, 5u)))) {
    param_1 = (block_pos_1 + vec3<u32>(1u, 1u, 0u));
    let x_289 : u32 = compute_block_id_vu3_(&(param_1));
    edge = x_289;
    let x_290 : u32 = edge;
    let x_292 : u32 = x_268.block_active[x_290];
    if ((x_292 == 0u)) {
      block_dims_3.x = vec2<u32>(4u, 4u).x;
      block_dims_3.y = vec2<u32>(4u, 4u).y;
    }
  }
  let x_301 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_301.x, x_301.z) == vec2<u32>(5u, 5u)))) {
    param_2 = (block_pos_1 + vec3<u32>(1u, 0u, 1u));
    let x_311 : u32 = compute_block_id_vu3_(&(param_2));
    edge_1 = x_311;
    let x_312 : u32 = edge_1;
    let x_314 : u32 = x_268.block_active[x_312];
    if ((x_314 == 0u)) {
      block_dims_3.x = vec2<u32>(4u, 4u).x;
      block_dims_3.z = vec2<u32>(4u, 4u).y;
    }
  }
  let x_322 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_322.y, x_322.z) == vec2<u32>(5u, 5u)))) {
    param_3 = (block_pos_1 + vec3<u32>(0u, 1u, 1u));
    let x_332 : u32 = compute_block_id_vu3_(&(param_3));
    edge_2 = x_332;
    let x_333 : u32 = edge_2;
    let x_335 : u32 = x_268.block_active[x_333];
    if ((x_335 == 0u)) {
      block_dims_3.y = vec2<u32>(4u, 4u).x;
      block_dims_3.z = vec2<u32>(4u, 4u).y;
    }
  }
  let x_344 : u32 = block_dims_3.x;
  if ((x_344 == 5u)) {
    param_4 = (block_pos_1 + vec3<u32>(1u, 0u, 0u));
    let x_352 : u32 = compute_block_id_vu3_(&(param_4));
    face = x_352;
    let x_353 : u32 = face;
    let x_355 : u32 = x_268.block_active[x_353];
    if ((x_355 == 0u)) {
      block_dims_3.x = 4u;
    }
  }
  let x_361 : u32 = block_dims_3.y;
  if ((x_361 == 5u)) {
    param_5 = (block_pos_1 + vec3<u32>(0u, 1u, 0u));
    let x_369 : u32 = compute_block_id_vu3_(&(param_5));
    face_1 = x_369;
    let x_370 : u32 = face_1;
    let x_372 : u32 = x_268.block_active[x_370];
    if ((x_372 == 0u)) {
      block_dims_3.y = 4u;
    }
  }
  let x_378 : u32 = block_dims_3.z;
  if ((x_378 == 5u)) {
    param_6 = (block_pos_1 + vec3<u32>(0u, 0u, 1u));
    let x_386 : u32 = compute_block_id_vu3_(&(param_6));
    face_2 = x_386;
    let x_387 : u32 = face_2;
    let x_389 : u32 = x_268.block_active[x_387];
    if ((x_389 == 0u)) {
      block_dims_3.z = 4u;
    }
  }
  let x_394 : vec3<u32> = block_dims_3;
  return x_394;
}

fn voxel_id_to_voxel_u1_(id_1 : ptr<function, u32>) -> vec3<u32> {
  let x_123 : u32 = *(id_1);
  let x_125 : u32 = *(id_1);
  let x_128 : u32 = *(id_1);
  return vec3<u32>((x_123 % 4u), ((x_125 / 4u) % 4u), (x_128 / 16u));
}

fn compute_voxel_id_vu3_vu3_(voxel_pos : ptr<function, vec3<u32>>, block_dims : ptr<function, vec3<u32>>) -> u32 {
  let x_135 : u32 = (*(voxel_pos)).x;
  let x_137 : u32 = (*(block_dims)).x;
  let x_139 : u32 = (*(voxel_pos)).y;
  let x_141 : u32 = (*(block_dims)).y;
  let x_143 : u32 = (*(voxel_pos)).z;
  return (x_135 + (x_137 * (x_139 + (x_141 * x_143))));
}

fn load_voxel_u1_vu3_vu3_vu3_(neighbor_id : u32, ghost_voxel_pos : vec3<u32>, neighbor_voxel_pos : vec3<u32>, block_dims_2 : vec3<u32>) {
  var neighbor_location : u32;
  var ghost_voxel_id : u32;
  var param_7 : vec3<u32>;
  var param_8 : vec3<u32>;
  var neighbor_voxel_id : u32;
  var param_9 : vec3<u32>;
  var param_10 : vec3<u32>;
  let x_403 : u32 = x_401.block_locations[neighbor_id];
  neighbor_location = x_403;
  param_7 = ghost_voxel_pos;
  param_8 = block_dims_2;
  let x_407 : u32 = compute_voxel_id_vu3_vu3_(&(param_7), &(param_8));
  ghost_voxel_id = x_407;
  param_9 = neighbor_voxel_pos;
  param_10 = vec3<u32>(4u, 4u, 4u);
  let x_411 : u32 = compute_voxel_id_vu3_vu3_(&(param_9), &(param_10));
  neighbor_voxel_id = x_411;
  let x_412 : u32 = ghost_voxel_id;
  let x_417 : u32 = neighbor_location;
  let x_420 : u32 = neighbor_voxel_id;
  let x_424 : f32 = x_416.decompressed[((x_417 * 64u) + x_420)];
  volume_block[x_412] = x_424;
  return;
}

fn load_block_u1_(block_id : u32) -> vec3<u32> {
  var block_pos_2 : vec3<u32>;
  var param_11 : u32;
  var n_blocks_3 : vec3<u32>;
  var block_dims_4 : vec3<u32>;
  var voxel_pos_2 : vec3<u32>;
  var param_12 : u32;
  var i_1 : u32;
  var ghost_voxel_pos_1 : vec3<u32>;
  var indexable_1 : array<vec3<u32>, 3u>;
  var neighbor_voxel_pos_1 : vec3<u32>;
  var indexable_2 : array<vec3<u32>, 3u>;
  var indexable_3 : array<vec3<u32>, 3u>;
  var neighbor_block_pos : vec3<u32>;
  var indexable_4 : array<vec3<u32>, 3u>;
  var neighbor_id_1 : u32;
  var param_13 : vec3<u32>;
  var i_2 : u32;
  var b : vec3<u32>;
  var indexable_5 : array<vec3<u32>, 3u>;
  var p_1 : vec3<u32>;
  var indexable_6 : array<vec3<u32>, 3u>;
  var ghost_voxel_pos_2 : vec3<u32>;
  var indexable_7 : array<vec3<u32>, 3u>;
  var neighbor_voxel_pos_2 : vec3<u32>;
  var indexable_8 : array<vec3<u32>, 3u>;
  var indexable_9 : array<vec3<u32>, 3u>;
  var indexable_10 : array<vec3<u32>, 3u>;
  var neighbor_block_pos_1 : vec3<u32>;
  var indexable_11 : array<vec3<u32>, 3u>;
  var neighbor_id_2 : u32;
  var param_14 : vec3<u32>;
  var ghost_voxel_pos_3 : vec3<u32>;
  var neighbor_block_pos_2 : vec3<u32>;
  var neighbor_id_3 : u32;
  var param_15 : vec3<u32>;
  let x_430 : u32 = gl_LocalInvocationID.x;
  volume_block[(x_430 * 2u)] = 0.0f;
  let x_435 : u32 = gl_LocalInvocationID.x;
  volume_block[((x_435 * 2u) + 1u)] = 0.0f;
  let x_443 : u32 = gl_LocalInvocationID.x;
  voxel_vertices[x_443] = 0u;
  workgroupBarrier();
  param_11 = block_id;
  let x_449 : vec3<u32> = block_id_to_pos_u1_(&(param_11));
  block_pos_2 = x_449;
  let x_452 : vec4<u32> = x_69.padded_dims;
  n_blocks_3 = (vec3<u32>(x_452.x, x_452.y, x_452.z) / vec3<u32>(4u, 4u, 4u));
  let x_456 : vec3<u32> = block_pos_2;
  let x_457 : vec3<u32> = compute_block_dims_with_ghost_vu3_(x_456);
  block_dims_4 = x_457;
  let x_461 : u32 = gl_LocalInvocationID.x;
  param_12 = x_461;
  let x_462 : vec3<u32> = voxel_id_to_voxel_u1_(&(param_12));
  voxel_pos_2 = x_462;
  let x_463 : vec3<u32> = voxel_pos_2;
  let x_464 : vec3<u32> = voxel_pos_2;
  let x_465 : vec3<u32> = block_dims_4;
  load_voxel_u1_vu3_vu3_vu3_(block_id, x_463, x_464, x_465);
  i_1 = 0u;
  loop {
    var x_485 : bool;
    var x_486 : bool;
    let x_473 : u32 = i_1;
    if ((x_473 < 3u)) {
    } else {
      break;
    }
    let x_476 : u32 = i_1;
    let x_478 : u32 = block_dims_4[x_476];
    let x_479 : bool = (x_478 == 5u);
    x_486 = x_479;
    if (x_479) {
      let x_482 : u32 = i_1;
      let x_484 : u32 = voxel_pos_2[x_482];
      x_485 = (x_484 == 3u);
      x_486 = x_485;
    }
    if (x_486) {
      let x_490 : vec3<u32> = voxel_pos_2;
      let x_493 : u32 = i_1;
      indexable_1 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_497 : vec3<u32> = indexable_1[x_493];
      ghost_voxel_pos_1 = (x_490 + x_497);
      let x_500 : vec3<u32> = ghost_voxel_pos_1;
      neighbor_voxel_pos_1 = x_500;
      let x_501 : u32 = i_1;
      indexable_2 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_504 : u32 = indexable_2[x_501].x;
      if ((x_504 == 1u)) {
        neighbor_voxel_pos_1.x = 0u;
      } else {
        let x_510 : u32 = i_1;
        indexable_3 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
        let x_513 : u32 = indexable_3[x_510].y;
        if ((x_513 == 1u)) {
          neighbor_voxel_pos_1.y = 0u;
        } else {
          neighbor_voxel_pos_1.z = 0u;
        }
      }
      let x_521 : vec3<u32> = block_pos_2;
      let x_522 : u32 = i_1;
      indexable_4 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_525 : vec3<u32> = indexable_4[x_522];
      neighbor_block_pos = (x_521 + x_525);
      let x_529 : vec3<u32> = neighbor_block_pos;
      param_13 = x_529;
      let x_530 : u32 = compute_block_id_vu3_(&(param_13));
      neighbor_id_1 = x_530;
      let x_531 : u32 = neighbor_id_1;
      let x_532 : vec3<u32> = ghost_voxel_pos_1;
      let x_533 : vec3<u32> = neighbor_voxel_pos_1;
      let x_534 : vec3<u32> = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_531, x_532, x_533, x_534);
    }

    continuing {
      let x_536 : u32 = i_1;
      i_1 = (x_536 + bitcast<u32>(1i));
    }
  }
  i_2 = 0u;
  loop {
    var x_582 : bool;
    var x_583 : bool;
    let x_544 : u32 = i_2;
    if ((x_544 < 3u)) {
    } else {
      break;
    }
    let x_547 : vec3<u32> = block_dims_4;
    let x_549 : u32 = i_2;
    indexable_5 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
    let x_552 : vec3<u32> = indexable_5[x_549];
    b = (x_547 * x_552);
    let x_555 : vec3<u32> = voxel_pos_2;
    let x_556 : u32 = i_2;
    indexable_6 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
    let x_559 : vec3<u32> = indexable_6[x_556];
    p_1 = (x_555 * x_559);
    let x_562 : u32 = b.x;
    let x_564 : u32 = b.y;
    let x_567 : u32 = b.z;
    let x_570 : bool = (((x_562 + x_564) + x_567) == 10u);
    x_583 = x_570;
    if (x_570) {
      let x_574 : u32 = p_1.x;
      let x_576 : u32 = p_1.y;
      let x_579 : u32 = p_1.z;
      x_582 = (((x_574 + x_576) + x_579) == 6u);
      x_583 = x_582;
    }
    if (x_583) {
      let x_587 : vec3<u32> = voxel_pos_2;
      let x_588 : u32 = i_2;
      indexable_7 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_591 : vec3<u32> = indexable_7[x_588];
      ghost_voxel_pos_2 = (x_587 + x_591);
      let x_594 : vec3<u32> = ghost_voxel_pos_2;
      neighbor_voxel_pos_2 = x_594;
      let x_595 : u32 = i_2;
      indexable_8 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_598 : u32 = indexable_8[x_595].x;
      if ((x_598 == 1u)) {
        neighbor_voxel_pos_2.x = 0u;
      }
      let x_603 : u32 = i_2;
      indexable_9 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_606 : u32 = indexable_9[x_603].y;
      if ((x_606 == 1u)) {
        neighbor_voxel_pos_2.y = 0u;
      }
      let x_611 : u32 = i_2;
      indexable_10 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_614 : u32 = indexable_10[x_611].z;
      if ((x_614 == 1u)) {
        neighbor_voxel_pos_2.z = 0u;
      }
      let x_620 : vec3<u32> = block_pos_2;
      let x_621 : u32 = i_2;
      indexable_11 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_624 : vec3<u32> = indexable_11[x_621];
      neighbor_block_pos_1 = (x_620 + x_624);
      let x_628 : vec3<u32> = neighbor_block_pos_1;
      param_14 = x_628;
      let x_629 : u32 = compute_block_id_vu3_(&(param_14));
      neighbor_id_2 = x_629;
      let x_630 : u32 = neighbor_id_2;
      let x_631 : vec3<u32> = ghost_voxel_pos_2;
      let x_632 : vec3<u32> = neighbor_voxel_pos_2;
      let x_633 : vec3<u32> = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_630, x_631, x_632, x_633);
    }

    continuing {
      let x_635 : u32 = i_2;
      i_2 = (x_635 + bitcast<u32>(1i));
    }
  }
  let x_637 : vec3<u32> = block_dims_4;
  let x_640 : vec3<u32> = voxel_pos_2;
  if ((all((x_637 == vec3<u32>(5u, 5u, 5u))) & all((x_640 == vec3<u32>(3u, 3u, 3u))))) {
    let x_648 : vec3<u32> = voxel_pos_2;
    ghost_voxel_pos_3 = (x_648 + vec3<u32>(1u, 1u, 1u));
    let x_651 : vec3<u32> = block_pos_2;
    neighbor_block_pos_2 = (x_651 + vec3<u32>(1u, 1u, 1u));
    let x_655 : vec3<u32> = neighbor_block_pos_2;
    param_15 = x_655;
    let x_656 : u32 = compute_block_id_vu3_(&(param_15));
    neighbor_id_3 = x_656;
    let x_657 : u32 = neighbor_id_3;
    let x_658 : vec3<u32> = ghost_voxel_pos_3;
    let x_660 : vec3<u32> = block_dims_4;
    load_voxel_u1_vu3_vu3_vu3_(x_657, x_658, vec3<u32>(0u, 0u, 0u), x_660);
  }
  workgroupBarrier();
  let x_662 : vec3<u32> = block_dims_4;
  return x_662;
}

fn compute_vertex_values_vu3_vu3_(voxel_pos_1 : ptr<function, vec3<u32>>, block_dims_1 : ptr<function, vec3<u32>>) -> array<f32, 8u> {
  var i : i32;
  var v : vec3<u32>;
  var indexable : array<vec3<i32>, 8u>;
  var voxel : u32;
  var values : array<f32, 8u>;
  i = 0i;
  loop {
    let x_158 : i32 = i;
    if ((x_158 < 8i)) {
    } else {
      break;
    }
    let x_173 : i32 = i;
    indexable = array<vec3<i32>, 8u>(vec3<i32>(0i, 0i, 0i), vec3<i32>(1i, 0i, 0i), vec3<i32>(1i, 1i, 0i), vec3<i32>(0i, 1i, 0i), vec3<i32>(0i, 0i, 1i), vec3<i32>(1i, 0i, 1i), vec3<i32>(1i, 1i, 1i), vec3<i32>(0i, 1i, 1i));
    let x_178 : vec3<i32> = indexable[x_173];
    v = bitcast<vec3<u32>>(x_178);
    let x_182 : u32 = (*(voxel_pos_1)).z;
    let x_184 : u32 = v.z;
    let x_187 : u32 = (*(block_dims_1)).y;
    let x_190 : u32 = (*(voxel_pos_1)).y;
    let x_193 : u32 = v.y;
    let x_196 : u32 = (*(block_dims_1)).x;
    let x_199 : u32 = (*(voxel_pos_1)).x;
    let x_202 : u32 = v.x;
    voxel = (((((((x_182 + x_184) * x_187) + x_190) + x_193) * x_196) + x_199) + x_202);
    let x_206 : i32 = i;
    let x_211 : u32 = voxel;
    let x_214 : f32 = volume_block[x_211];
    values[x_206] = x_214;

    continuing {
      let x_217 : i32 = i;
      i = (x_217 + 1i);
    }
  }
  let x_219 : array<f32, 8u> = values;
  return x_219;
}

fn lerp_verts_vi3_vi3_f1_f1_(va : vec3<i32>, vb : vec3<i32>, fa : f32, fb : f32) -> vec3<f32> {
  var t : f32;
  t = 0.0f;
  if ((abs((fa - fb)) < 0.001f)) {
    t = 0.0f;
  } else {
    let x_709 : f32 = x_69.isovalue;
    t = ((x_709 - fa) / (fb - fa));
  }
  let x_715 : f32 = t;
  let x_724 : f32 = t;
  let x_733 : f32 = t;
  return vec3<f32>((f32(va.x) + (x_715 * f32((vb.x - va.x)))), (f32(va.y) + (x_724 * f32((vb.y - va.y)))), (f32(va.z) + (x_733 * f32((vb.z - va.z)))));
}

fn compress_position_vf3_(p : ptr<function, vec3<f32>>) -> u32 {
  var quantized : vec3<u32>;
  var compressed : u32;
  let x_666 : vec3<f32> = *(p);
  quantized = vec3<u32>((((x_666 - vec3<f32>(0.5f, 0.5f, 0.5f)) * 0.25f) * 1023.0f));
  compressed = 0u;
  let x_677 : u32 = quantized.x;
  let x_682 : u32 = compressed;
  compressed = (x_682 | ((x_677 & 1023u) << bitcast<u32>(20i)));
  let x_685 : u32 = quantized.y;
  let x_689 : u32 = compressed;
  compressed = (x_689 | ((x_685 & 1023u) << bitcast<u32>(10i)));
  let x_692 : u32 = quantized.z;
  let x_694 : u32 = compressed;
  compressed = (x_694 | (x_692 & 1023u));
  let x_696 : u32 = compressed;
  return x_696;
}

fn main_1() {
  var block_info : BlockInfo;
  var block_id_1 : u32;
  var block_dims_5 : vec3<u32>;
  var voxel_pos_3 : vec3<u32>;
  var param_16 : u32;
  var nverts : u32;
  var values_1 : array<f32, 8u>;
  var param_17 : vec3<u32>;
  var param_18 : vec3<u32>;
  var case_index : u32;
  var i_3 : i32;
  var chunk : u32;
  var table_chunk : vec4<i32>;
  var t_1 : u32;
  var offs : u32;
  var d : i32;
  var a : u32;
  var b_1 : u32;
  var d_1 : i32;
  var a_1 : u32;
  var b_2 : u32;
  var tmp : u32;
  var vertex_offset : u32;
  var values_2 : array<f32, 8u>;
  var param_19 : vec3<u32>;
  var param_20 : vec3<u32>;
  var case_index_1 : u32;
  var i_4 : i32;
  var cid : u32;
  var chunk_1 : u32;
  var table_chunk_1 : vec4<i32>;
  var t_2 : u32;
  var v0 : u32;
  var indexable_12 : array<array<i32, 2u>, 12u>;
  var v1 : u32;
  var indexable_13 : array<array<i32, 2u>, 12u>;
  var v_1 : vec3<f32>;
  var indexable_14 : array<vec3<i32>, 8u>;
  var indexable_15 : array<vec3<i32>, 8u>;
  var param_21 : vec3<f32>;
  let x_753 : u32 = gl_WorkGroupID.x;
  let x_756 : BlockInfo_1 = x_750.blocks_with_verts[x_753];
  block_info.index = x_756.index;
  block_info.offset = x_756.offset;
  let x_767 : u32 = block_info.index;
  let x_769 : u32 = x_765.block_ids[x_767];
  block_id_1 = x_769;
  let x_771 : u32 = block_id_1;
  let x_772 : vec3<u32> = load_block_u1_(x_771);
  block_dims_5 = x_772;
  let x_776 : u32 = gl_LocalInvocationID.x;
  param_16 = x_776;
  let x_777 : vec3<u32> = voxel_id_to_voxel_u1_(&(param_16));
  voxel_pos_3 = x_777;
  nverts = 0u;
  let x_779 : vec3<u32> = voxel_pos_3;
  let x_781 : vec3<u32> = block_dims_5;
  if (all(((x_779 + vec3<u32>(1u, 1u, 1u)) < x_781))) {
    let x_788 : vec3<u32> = voxel_pos_3;
    param_17 = x_788;
    let x_790 : vec3<u32> = block_dims_5;
    param_18 = x_790;
    let x_791 : array<f32, 8u> = compute_vertex_values_vu3_vu3_(&(param_17), &(param_18));
    values_1 = x_791;
    case_index = 0u;
    i_3 = 0i;
    loop {
      let x_799 : i32 = i_3;
      if ((x_799 < 8i)) {
      } else {
        break;
      }
      let x_801 : i32 = i_3;
      let x_803 : f32 = values_1[x_801];
      let x_805 : f32 = x_69.isovalue;
      if ((x_803 <= x_805)) {
        let x_809 : i32 = i_3;
        let x_812 : u32 = case_index;
        case_index = (x_812 | bitcast<u32>((1i << bitcast<u32>(x_809))));
      }

      continuing {
        let x_814 : i32 = i_3;
        i_3 = (x_814 + 1i);
      }
    }
    let x_817 : u32 = case_index;
    chunk = (x_817 * 4u);
    let x_827 : u32 = chunk;
    let x_830 : vec4<i32> = x_826.tri_table[x_827];
    table_chunk = x_830;
    t_1 = 0u;
    loop {
      let x_837 : u32 = t_1;
      let x_839 : i32 = table_chunk[x_837];
      if ((x_839 != -1i)) {
      } else {
        break;
      }
      let x_842 : u32 = nverts;
      nverts = (x_842 + bitcast<u32>(1i));
      let x_844 : u32 = t_1;
      if ((x_844 == 3u)) {
        let x_848 : u32 = chunk;
        let x_849 : u32 = (x_848 + bitcast<u32>(1i));
        chunk = x_849;
        let x_851 : vec4<i32> = x_826.tri_table[x_849];
        table_chunk = x_851;
        t_1 = 0u;
      } else {
        let x_853 : u32 = t_1;
        t_1 = (x_853 + bitcast<u32>(1i));
      }
    }
  }
  let x_856 : u32 = gl_LocalInvocationID.x;
  let x_857 : u32 = nverts;
  voxel_vertices[x_856] = x_857;
  offs = 1u;
  d = 32i;
  loop {
    let x_867 : i32 = d;
    if ((x_867 > 0i)) {
    } else {
      break;
    }
    workgroupBarrier();
    let x_870 : u32 = gl_LocalInvocationID.x;
    let x_871 : i32 = d;
    if ((x_870 < bitcast<u32>(x_871))) {
      let x_877 : u32 = offs;
      let x_879 : u32 = gl_LocalInvocationID.x;
      a = ((x_877 * ((2u * x_879) + 1u)) - 1u);
      let x_885 : u32 = offs;
      let x_887 : u32 = gl_LocalInvocationID.x;
      b_1 = ((x_885 * ((2u * x_887) + 2u)) - 1u);
      let x_892 : u32 = b_1;
      let x_893 : u32 = a;
      let x_895 : u32 = voxel_vertices[x_893];
      let x_897 : u32 = voxel_vertices[x_892];
      voxel_vertices[x_892] = (x_897 + x_895);
    }
    let x_900 : u32 = offs;
    offs = (x_900 << bitcast<u32>(1i));

    continuing {
      let x_902 : i32 = d;
      d = (x_902 >> bitcast<u32>(1i));
    }
  }
  let x_905 : u32 = gl_LocalInvocationID.x;
  if ((x_905 == 0u)) {
    voxel_vertices[63i] = 0u;
  }
  d_1 = 1i;
  loop {
    let x_917 : i32 = d_1;
    if ((x_917 < 64i)) {
    } else {
      break;
    }
    let x_920 : u32 = offs;
    offs = (x_920 >> bitcast<u32>(1i));
    workgroupBarrier();
    let x_923 : u32 = gl_LocalInvocationID.x;
    let x_924 : i32 = d_1;
    if ((x_923 < bitcast<u32>(x_924))) {
      let x_930 : u32 = offs;
      let x_932 : u32 = gl_LocalInvocationID.x;
      a_1 = ((x_930 * ((2u * x_932) + 1u)) - 1u);
      let x_938 : u32 = offs;
      let x_940 : u32 = gl_LocalInvocationID.x;
      b_2 = ((x_938 * ((2u * x_940) + 2u)) - 1u);
      let x_946 : u32 = a_1;
      let x_948 : u32 = voxel_vertices[x_946];
      tmp = x_948;
      let x_949 : u32 = a_1;
      let x_950 : u32 = b_2;
      let x_952 : u32 = voxel_vertices[x_950];
      voxel_vertices[x_949] = x_952;
      let x_954 : u32 = b_2;
      let x_955 : u32 = tmp;
      let x_957 : u32 = voxel_vertices[x_954];
      voxel_vertices[x_954] = (x_957 + x_955);
    }

    continuing {
      let x_960 : i32 = d_1;
      d_1 = (x_960 << bitcast<u32>(1i));
    }
  }
  workgroupBarrier();
  let x_964 : u32 = block_info.offset;
  let x_966 : u32 = gl_LocalInvocationID.x;
  let x_968 : u32 = voxel_vertices[x_966];
  vertex_offset = (x_964 + x_968);
  let x_970 : vec3<u32> = voxel_pos_3;
  let x_972 : vec3<u32> = block_dims_5;
  if (all(((x_970 + vec3<u32>(1u, 1u, 1u)) < x_972))) {
    let x_979 : vec3<u32> = voxel_pos_3;
    param_19 = x_979;
    let x_981 : vec3<u32> = block_dims_5;
    param_20 = x_981;
    let x_982 : array<f32, 8u> = compute_vertex_values_vu3_vu3_(&(param_19), &(param_20));
    values_2 = x_982;
    case_index_1 = 0u;
    i_4 = 0i;
    loop {
      let x_990 : i32 = i_4;
      if ((x_990 < 8i)) {
      } else {
        break;
      }
      let x_992 : i32 = i_4;
      let x_994 : f32 = values_2[x_992];
      let x_996 : f32 = x_69.isovalue;
      if ((x_994 <= x_996)) {
        let x_1000 : i32 = i_4;
        let x_1003 : u32 = case_index_1;
        case_index_1 = (x_1003 | bitcast<u32>((1i << bitcast<u32>(x_1000))));
      }

      continuing {
        let x_1005 : i32 = i_4;
        i_4 = (x_1005 + 1i);
      }
    }
    cid = 0u;
    let x_1009 : u32 = case_index_1;
    chunk_1 = (x_1009 * 4u);
    let x_1012 : u32 = chunk_1;
    let x_1014 : vec4<i32> = x_826.tri_table[x_1012];
    table_chunk_1 = x_1014;
    t_2 = 0u;
    loop {
      let x_1021 : u32 = t_2;
      let x_1023 : i32 = table_chunk_1[x_1021];
      if ((x_1023 != -1i)) {
      } else {
        break;
      }
      let x_1047 : u32 = t_2;
      let x_1049 : i32 = table_chunk_1[x_1047];
      indexable_12 = array<array<i32, 2u>, 12u>(array<i32, 2u>(0i, 1i), array<i32, 2u>(1i, 2i), array<i32, 2u>(2i, 3i), array<i32, 2u>(3i, 0i), array<i32, 2u>(4i, 5i), array<i32, 2u>(6i, 5i), array<i32, 2u>(6i, 7i), array<i32, 2u>(7i, 4i), array<i32, 2u>(0i, 4i), array<i32, 2u>(1i, 5i), array<i32, 2u>(2i, 6i), array<i32, 2u>(3i, 7i));
      let x_1053 : i32 = indexable_12[x_1049][0i];
      v0 = bitcast<u32>(x_1053);
      let x_1056 : u32 = t_2;
      let x_1058 : i32 = table_chunk_1[x_1056];
      indexable_13 = array<array<i32, 2u>, 12u>(array<i32, 2u>(0i, 1i), array<i32, 2u>(1i, 2i), array<i32, 2u>(2i, 3i), array<i32, 2u>(3i, 0i), array<i32, 2u>(4i, 5i), array<i32, 2u>(6i, 5i), array<i32, 2u>(6i, 7i), array<i32, 2u>(7i, 4i), array<i32, 2u>(0i, 4i), array<i32, 2u>(1i, 5i), array<i32, 2u>(2i, 6i), array<i32, 2u>(3i, 7i));
      let x_1061 : i32 = indexable_13[x_1058][1i];
      v1 = bitcast<u32>(x_1061);
      let x_1064 : u32 = v0;
      indexable_14 = array<vec3<i32>, 8u>(vec3<i32>(0i, 0i, 0i), vec3<i32>(1i, 0i, 0i), vec3<i32>(1i, 1i, 0i), vec3<i32>(0i, 1i, 0i), vec3<i32>(0i, 0i, 1i), vec3<i32>(1i, 0i, 1i), vec3<i32>(1i, 1i, 1i), vec3<i32>(0i, 1i, 1i));
      let x_1067 : vec3<i32> = indexable_14[x_1064];
      let x_1068 : u32 = v1;
      indexable_15 = array<vec3<i32>, 8u>(vec3<i32>(0i, 0i, 0i), vec3<i32>(1i, 0i, 0i), vec3<i32>(1i, 1i, 0i), vec3<i32>(0i, 1i, 0i), vec3<i32>(0i, 0i, 1i), vec3<i32>(1i, 0i, 1i), vec3<i32>(1i, 1i, 1i), vec3<i32>(0i, 1i, 1i));
      let x_1071 : vec3<i32> = indexable_15[x_1068];
      let x_1072 : u32 = v0;
      let x_1074 : f32 = values_2[x_1072];
      let x_1075 : u32 = v1;
      let x_1077 : f32 = values_2[x_1075];
      let x_1078 : vec3<f32> = lerp_verts_vi3_vi3_f1_f1_(x_1067, x_1071, x_1074, x_1077);
      let x_1079 : vec3<u32> = voxel_pos_3;
      v_1 = ((x_1078 + vec3<f32>(x_1079)) + vec3<f32>(0.5f, 0.5f, 0.5f));
      let x_1088 : u32 = vertex_offset;
      let x_1089 : u32 = chunk_1;
      let x_1093 : u32 = t_2;
      let x_1096 : vec3<f32> = v_1;
      param_21 = x_1096;
      let x_1097 : u32 = compress_position_vf3_(&(param_21));
      let x_1098 : u32 = block_id_1;
      x_1087.verts[((x_1088 + (4u * (x_1089 % 4u))) + x_1093)] = vec2<u32>(x_1097, x_1098);
      let x_1102 : u32 = t_2;
      if ((x_1102 == 3u)) {
        let x_1106 : u32 = chunk_1;
        let x_1107 : u32 = (x_1106 + bitcast<u32>(1i));
        chunk_1 = x_1107;
        let x_1109 : vec4<i32> = x_826.tri_table[x_1107];
        table_chunk_1 = x_1109;
        t_2 = 0u;
      } else {
        let x_1111 : u32 = t_2;
        t_2 = (x_1111 + bitcast<u32>(1i));
      }

      continuing {
        let x_1113 : u32 = cid;
        cid = (x_1113 + bitcast<u32>(1i));
      }
    }
  }
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(local_invocation_id) gl_LocalInvocationID_param : vec3<u32>, @builtin(workgroup_id) gl_WorkGroupID_param : vec3<u32>) {
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  gl_WorkGroupID = gl_WorkGroupID_param;
  main_1();
}
`;

const build_block_info_comp_spv = `type RTArr = array<u32>;

type RTArr_1 = array<u32>;

struct BlockWithVertsIndices {
  block_with_verts_indices : RTArr_1,
}

struct DecompressBlockOffset {
  start_block_offset : u32,
}

struct BlockOffsets {
  block_offsets : RTArr_1,
}

struct BlockInfo {
  index : u32,
  offset : u32,
}

type RTArr_2 = array<BlockInfo>;

struct BlockInformation {
  blocks_with_verts : RTArr_2,
}

@group(1) @binding(1) var<storage, read_write> x_12 : BlockWithVertsIndices;

@group(2) @binding(0) var<uniform> x_17 : DecompressBlockOffset;

var<private> gl_WorkGroupID : vec3<u32>;

@group(1) @binding(0) var<storage, read_write> x_35 : BlockOffsets;

@group(0) @binding(0) var<storage, read_write> x_47 : BlockInformation;

fn main_1() {
  var index : u32;
  var offset_1 : u32;
  let x_20 : u32 = x_17.start_block_offset;
  let x_27 : u32 = gl_WorkGroupID.x;
  let x_30 : u32 = x_12.block_with_verts_indices[(x_20 + x_27)];
  index = x_30;
  let x_37 : u32 = x_17.start_block_offset;
  let x_39 : u32 = gl_WorkGroupID.x;
  let x_42 : u32 = x_35.block_offsets[(x_37 + x_39)];
  offset_1 = x_42;
  let x_49 : u32 = gl_WorkGroupID.x;
  let x_50 : u32 = index;
  x_47.blocks_with_verts[x_49].index = x_50;
  let x_53 : u32 = gl_WorkGroupID.x;
  let x_55 : u32 = offset_1;
  x_47.blocks_with_verts[x_53].offset = x_55;
  return;
}

@compute @workgroup_size(1i, 1i, 1i)
fn main(@builtin(workgroup_id) gl_WorkGroupID_param : vec3<u32>) {
  gl_WorkGroupID = gl_WorkGroupID_param;
  main_1();
}
`;

const lru_cache_init_comp_spv = `struct OldSize {
  old_size : u32,
}

struct WorkItemOffset {
  work_item_offset : u32,
  total_work_groups : u32,
  cache_size : u32,
}

struct Slot {
  age : u32,
  available : u32,
  item_id : i32,
}

type RTArr = array<Slot>;

struct SlotData {
  slot_data : RTArr,
}

type RTArr_1 = array<i32>;

struct CachedItemSlots {
  cached_item_slot : RTArr_1,
}

type RTArr_2 = array<u32>;

struct SlotAvailableIDs {
  slot_available_id : RTArr_2,
}

@group(1) @binding(0) var<uniform> x_11 : OldSize;

@group(2) @binding(0) var<uniform> x_19 : WorkItemOffset;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(0) @binding(2) var<storage, read_write> x_46 : SlotData;

@group(0) @binding(0) var<storage, read_write> x_61 : CachedItemSlots;

@group(0) @binding(1) var<storage, read_write> x_65 : SlotAvailableIDs;

fn main_1() {
  var item_idx : u32;
  let x_16 : u32 = x_11.old_size;
  let x_21 : u32 = x_19.work_item_offset;
  let x_31 : u32 = gl_GlobalInvocationID.x;
  item_idx = ((x_16 + (x_21 * 32u)) + x_31);
  let x_33 : u32 = item_idx;
  let x_36 : u32 = x_19.cache_size;
  if ((x_33 >= x_36)) {
    return;
  }
  let x_47 : u32 = item_idx;
  x_46.slot_data[x_47].age = 100000u;
  let x_50 : u32 = item_idx;
  x_46.slot_data[x_50].available = 1u;
  let x_54 : u32 = item_idx;
  x_46.slot_data[x_54].item_id = -1i;
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_cache_mark_new_items_comp_spv = `struct PushConstants {
  global_idx_offset : u32,
  num_work_items : u32,
}

type RTArr = array<i32>;

struct CachedItemSlots {
  cached_item_slot : RTArr,
}

type RTArr_1 = array<u32>;

type RTArr_2 = array<u32>;

struct ItemNeedsCaching {
  item_needs_caching : RTArr_2,
}

type RTArr_3 = array<u32>;

struct ItemNeeded {
  item_needed : RTArr_2,
}

struct Slot {
  age : u32,
  available : u32,
  item_id : i32,
}

type RTArr_4 = array<Slot>;

struct SlotData {
  slot_data : RTArr_4,
}

struct SlotAvailableIDs {
  slot_available_id : RTArr_2,
}

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(2) @binding(0) var<uniform> x_18 : PushConstants;

@group(0) @binding(0) var<storage, read_write> x_32 : CachedItemSlots;

@group(1) @binding(1) var<storage, read_write> x_45 : ItemNeedsCaching;

@group(1) @binding(0) var<storage, read> x_51 : ItemNeeded;

@group(0) @binding(2) var<storage, read_write> x_63 : SlotData;

@group(0) @binding(1) var<storage, read_write> x_81 : SlotAvailableIDs;

fn main_1() {
  var idx : u32;
  var slot : i32;
  let x_15 : u32 = gl_GlobalInvocationID.x;
  let x_23 : u32 = x_18.global_idx_offset;
  idx = (x_15 + (x_23 * 32u));
  let x_33 : u32 = idx;
  let x_36 : i32 = x_32.cached_item_slot[x_33];
  slot = x_36;
  let x_37 : i32 = slot;
  if ((x_37 >= 0i)) {
    let x_46 : u32 = idx;
    x_45.item_needs_caching[x_46] = 0u;
    let x_52 : u32 = idx;
    let x_54 : u32 = x_51.item_needed[x_52];
    if ((x_54 == 1u)) {
      let x_64 : i32 = slot;
      x_63.slot_data[x_64].age = 0u;
      let x_66 : i32 = slot;
      x_63.slot_data[x_66].available = 0u;
    } else {
      let x_70 : i32 = slot;
      x_63.slot_data[x_70].available = 1u;
    }
  } else {
    let x_73 : u32 = idx;
    let x_74 : u32 = idx;
    let x_76 : u32 = x_51.item_needed[x_74];
    x_45.item_needs_caching[x_73] = x_76;
  }
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_cache_update_comp_spv = `struct WorkItemOffset {
  work_item_offset : u32,
  total_work_groups : u32,
  num_new_items : u32,
}

type RTArr = array<u32>;

type RTArr_1 = array<u32>;

struct NewItemIDs {
  new_items : RTArr_1,
}

struct SlotAvailableIDs {
  slot_available_id : RTArr_1,
}

struct Slot {
  age : u32,
  available : u32,
  item_id : i32,
}

type RTArr_2 = array<Slot>;

struct SlotData {
  slot_data : RTArr_2,
}

type RTArr_3 = array<i32>;

struct CachedItemSlots {
  cached_item_slot : RTArr_3,
}

@group(2) @binding(0) var<uniform> x_11 : WorkItemOffset;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(1) @binding(0) var<storage, read_write> x_40 : NewItemIDs;

@group(0) @binding(1) var<storage, read_write> x_48 : SlotAvailableIDs;

@group(0) @binding(2) var<storage, read_write> x_58 : SlotData;

@group(0) @binding(0) var<storage, read_write> x_71 : CachedItemSlots;

fn main_1() {
  var work_item_id : u32;
  var item : u32;
  var slot : u32;
  var prev : i32;
  let x_16 : u32 = x_11.work_item_offset;
  let x_25 : u32 = gl_GlobalInvocationID.x;
  work_item_id = ((x_16 * 32u) + x_25);
  let x_27 : u32 = work_item_id;
  let x_30 : u32 = x_11.num_new_items;
  if ((x_27 >= x_30)) {
    return;
  }
  let x_41 : u32 = work_item_id;
  let x_43 : u32 = x_40.new_items[x_41];
  item = x_43;
  let x_49 : u32 = work_item_id;
  let x_51 : u32 = x_48.slot_available_id[x_49];
  slot = x_51;
  let x_59 : u32 = slot;
  let x_62 : i32 = x_58.slot_data[x_59].item_id;
  prev = x_62;
  let x_63 : i32 = prev;
  if ((x_63 != -1i)) {
    let x_72 : i32 = prev;
    x_71.cached_item_slot[x_72] = -1i;
  }
  let x_74 : u32 = slot;
  x_58.slot_data[x_74].age = 0u;
  let x_76 : u32 = slot;
  let x_77 : u32 = item;
  x_58.slot_data[x_76].item_id = bitcast<i32>(x_77);
  let x_80 : u32 = slot;
  x_58.slot_data[x_80].available = 0u;
  let x_83 : u32 = item;
  let x_84 : u32 = slot;
  x_71.cached_item_slot[x_83] = bitcast<i32>(x_84);
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_copy_available_slot_age_comp_spv = `struct WorkItemOffset {
  work_item_offset : u32,
  total_work_groups : u32,
  num_slots_available : u32,
}

type RTArr = array<u32>;

type RTArr_1 = array<u32>;

struct AvailableSlotAges {
  available_slot_ages : RTArr_1,
}

struct Slot {
  age : u32,
  available : u32,
  item_id : i32,
}

type RTArr_2 = array<Slot>;

struct SlotData {
  slot_data : RTArr_2,
}

struct SlotAvailableIDs {
  slot_available_id : RTArr_1,
}

type RTArr_3 = array<i32>;

struct CachedItemSlots {
  cached_item_slot : RTArr_3,
}

@group(2) @binding(0) var<uniform> x_11 : WorkItemOffset;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(1) @binding(0) var<storage, read_write> x_39 : AvailableSlotAges;

@group(0) @binding(2) var<storage, read_write> x_45 : SlotData;

@group(0) @binding(1) var<storage, read_write> x_49 : SlotAvailableIDs;

@group(0) @binding(0) var<storage, read_write> x_59 : CachedItemSlots;

fn main_1() {
  var item_idx : u32;
  let x_16 : u32 = x_11.work_item_offset;
  let x_25 : u32 = gl_GlobalInvocationID.x;
  item_idx = ((x_16 * 32u) + x_25);
  let x_27 : u32 = item_idx;
  let x_30 : u32 = x_11.num_slots_available;
  if ((x_27 >= x_30)) {
    return;
  }
  let x_40 : u32 = item_idx;
  let x_50 : u32 = item_idx;
  let x_52 : u32 = x_49.slot_available_id[x_50];
  let x_54 : u32 = x_45.slot_data[x_52].age;
  x_39.available_slot_ages[x_40] = x_54;
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_cache_age_slots_comp_spv = `struct PushConstants {
  work_group_offset : u32,
  total_work_groups : u32,
  cache_size : u32,
}

struct Slot {
  age : u32,
  available : u32,
  item_id : i32,
}

type RTArr = array<Slot>;

struct SlotData {
  slot_data : RTArr,
}

type RTArr_1 = array<i32>;

struct CachedItemSlots {
  cached_item_slot : RTArr_1,
}

type RTArr_2 = array<u32>;

struct SlotAvailableIDs {
  slot_available_id : RTArr_2,
}

@group(1) @binding(0) var<uniform> x_11 : PushConstants;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(0) @binding(2) var<storage, read_write> x_40 : SlotData;

@group(0) @binding(0) var<storage, read_write> x_50 : CachedItemSlots;

@group(0) @binding(1) var<storage, read_write> x_54 : SlotAvailableIDs;

fn main_1() {
  var idx : u32;
  let x_16 : u32 = x_11.work_group_offset;
  let x_25 : u32 = gl_GlobalInvocationID.x;
  idx = ((x_16 * 32u) + x_25);
  let x_27 : u32 = idx;
  let x_30 : u32 = x_11.cache_size;
  if ((x_27 >= x_30)) {
    return;
  }
  let x_41 : u32 = idx;
  let x_44 : u32 = x_40.slot_data[x_41].age;
  x_40.slot_data[x_41].age = (x_44 + 1u);
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_cache_extract_slot_available_comp_spv = `struct WorkItemOffset {
  work_item_offset : u32,
  total_work_groups : u32,
  cache_size : u32,
}

type RTArr = array<u32>;

type RTArr_1 = array<u32>;

struct Output {
  out_buf : RTArr_1,
}

struct Slot {
  age : u32,
  available : u32,
  item_id : i32,
}

type RTArr_2 = array<Slot>;

struct SlotData {
  slot_data : RTArr_2,
}

type RTArr_3 = array<i32>;

struct CachedItemSlots {
  cached_item_slot : RTArr_3,
}

struct SlotAvailableIDs {
  slot_available_id : RTArr_1,
}

@group(2) @binding(0) var<uniform> x_11 : WorkItemOffset;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(1) @binding(0) var<storage, read_write> x_39 : Output;

@group(0) @binding(2) var<storage, read_write> x_45 : SlotData;

@group(0) @binding(0) var<storage, read_write> x_54 : CachedItemSlots;

@group(0) @binding(1) var<storage, read_write> x_58 : SlotAvailableIDs;

fn main_1() {
  var work_item_id : u32;
  let x_16 : u32 = x_11.work_item_offset;
  let x_25 : u32 = gl_GlobalInvocationID.x;
  work_item_id = ((x_16 * 32u) + x_25);
  let x_27 : u32 = work_item_id;
  let x_30 : u32 = x_11.cache_size;
  if ((x_27 >= x_30)) {
    return;
  }
  let x_40 : u32 = work_item_id;
  let x_46 : u32 = work_item_id;
  let x_49 : u32 = x_45.slot_data[x_46].available;
  x_39.out_buf[x_40] = x_49;
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const radix_sort_chunk_comp_spv = `struct PushConstants {
  work_group_offset : u32,
}

struct BufferInfo {
  size : u32,
}

type RTArr = array<u32>;

type RTArr_1 = array<u32>;

struct Keys {
  keys : RTArr_1,
}

struct Values {
  values : RTArr_1,
}

@group(2) @binding(0) var<uniform> x_11 : PushConstants;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(0) @binding(0) var<uniform> x_30 : BufferInfo;

var<workgroup> key_buf : array<u32, 64u>;

var<private> gl_LocalInvocationID : vec3<u32>;

@group(1) @binding(0) var<storage, read_write> x_46 : Keys;

var<workgroup> val_buf : array<u32, 64u>;

@group(1) @binding(1) var<storage, read_write> x_58 : Values;

var<workgroup> scratch : array<u32, 64u>;

var<workgroup> total_false : u32;

var<workgroup> sorted_key_buf : array<u32, 64u>;

var<workgroup> sorted_val_buf : array<u32, 64u>;

fn main_1() {
  var item_idx : u32;
  var i : u32;
  var mask : u32;
  var offs : u32;
  var d : i32;
  var a : u32;
  var b : u32;
  var d_1 : i32;
  var a_1 : u32;
  var b_1 : u32;
  var tmp : u32;
  var f : u32;
  var t : u32;
  let x_16 : u32 = x_11.work_group_offset;
  let x_25 : u32 = gl_GlobalInvocationID.x;
  item_idx = ((x_16 * 64u) + x_25);
  let x_27 : u32 = item_idx;
  let x_32 : u32 = x_30.size;
  if ((x_27 < x_32)) {
    let x_42 : u32 = gl_LocalInvocationID.x;
    let x_47 : u32 = item_idx;
    let x_49 : u32 = x_46.keys[x_47];
    key_buf[x_42] = x_49;
    let x_54 : u32 = gl_LocalInvocationID.x;
    let x_59 : u32 = item_idx;
    let x_61 : u32 = x_58.values[x_59];
    val_buf[x_54] = x_61;
  } else {
    let x_65 : u32 = gl_LocalInvocationID.x;
    key_buf[x_65] = 4294967295u;
    let x_69 : u32 = gl_LocalInvocationID.x;
    val_buf[x_69] = 4294967295u;
  }
  i = 0u;
  loop {
    let x_77 : u32 = i;
    if ((x_77 < 32u)) {
    } else {
      break;
    }
    workgroupBarrier();
    let x_84 : u32 = i;
    mask = bitcast<u32>((1i << x_84));
    let x_89 : u32 = gl_LocalInvocationID.x;
    let x_91 : u32 = gl_LocalInvocationID.x;
    let x_93 : u32 = key_buf[x_91];
    let x_94 : u32 = mask;
    scratch[x_89] = bitcast<u32>(select(1i, 0i, ((x_93 & x_94) != 0u)));
    offs = 1u;
    d = 32i;
    loop {
      let x_110 : i32 = d;
      if ((x_110 > 0i)) {
      } else {
        break;
      }
      workgroupBarrier();
      let x_113 : u32 = gl_LocalInvocationID.x;
      let x_114 : i32 = d;
      if ((x_113 < bitcast<u32>(x_114))) {
        let x_120 : u32 = offs;
        let x_122 : u32 = gl_LocalInvocationID.x;
        a = ((x_120 * ((2u * x_122) + 1u)) - 1u);
        let x_128 : u32 = offs;
        let x_130 : u32 = gl_LocalInvocationID.x;
        b = ((x_128 * ((2u * x_130) + 2u)) - 1u);
        let x_135 : u32 = b;
        let x_136 : u32 = a;
        let x_138 : u32 = scratch[x_136];
        let x_140 : u32 = scratch[x_135];
        scratch[x_135] = (x_140 + x_138);
      }
      let x_143 : u32 = offs;
      offs = (x_143 << bitcast<u32>(1i));

      continuing {
        let x_145 : i32 = d;
        d = (x_145 >> bitcast<u32>(1i));
      }
    }
    let x_148 : u32 = gl_LocalInvocationID.x;
    if ((x_148 == 0u)) {
      let x_155 : u32 = scratch[63i];
      total_false = x_155;
      scratch[63i] = 0u;
    }
    d_1 = 1i;
    loop {
      let x_163 : i32 = d_1;
      if ((x_163 < 64i)) {
      } else {
        break;
      }
      let x_166 : u32 = offs;
      offs = (x_166 >> bitcast<u32>(1i));
      workgroupBarrier();
      let x_169 : u32 = gl_LocalInvocationID.x;
      let x_170 : i32 = d_1;
      if ((x_169 < bitcast<u32>(x_170))) {
        let x_176 : u32 = offs;
        let x_178 : u32 = gl_LocalInvocationID.x;
        a_1 = ((x_176 * ((2u * x_178) + 1u)) - 1u);
        let x_184 : u32 = offs;
        let x_186 : u32 = gl_LocalInvocationID.x;
        b_1 = ((x_184 * ((2u * x_186) + 2u)) - 1u);
        let x_192 : u32 = a_1;
        let x_194 : u32 = scratch[x_192];
        tmp = x_194;
        let x_195 : u32 = a_1;
        let x_196 : u32 = b_1;
        let x_198 : u32 = scratch[x_196];
        scratch[x_195] = x_198;
        let x_200 : u32 = b_1;
        let x_201 : u32 = tmp;
        let x_203 : u32 = scratch[x_200];
        scratch[x_200] = (x_203 + x_201);
      }

      continuing {
        let x_206 : i32 = d_1;
        d_1 = (x_206 << bitcast<u32>(1i));
      }
    }
    workgroupBarrier();
    let x_210 : u32 = gl_LocalInvocationID.x;
    let x_212 : u32 = scratch[x_210];
    f = x_212;
    let x_215 : u32 = gl_LocalInvocationID.x;
    let x_216 : u32 = f;
    let x_218 : u32 = total_false;
    t = ((x_215 - x_216) + x_218);
    let x_221 : u32 = gl_LocalInvocationID.x;
    let x_223 : u32 = key_buf[x_221];
    let x_224 : u32 = mask;
    if (((x_223 & x_224) != 0u)) {
      let x_230 : u32 = t;
      let x_232 : u32 = gl_LocalInvocationID.x;
      let x_234 : u32 = key_buf[x_232];
      sorted_key_buf[x_230] = x_234;
      let x_237 : u32 = t;
      let x_239 : u32 = gl_LocalInvocationID.x;
      let x_241 : u32 = val_buf[x_239];
      sorted_val_buf[x_237] = x_241;
    } else {
      let x_244 : u32 = f;
      let x_246 : u32 = gl_LocalInvocationID.x;
      let x_248 : u32 = key_buf[x_246];
      sorted_key_buf[x_244] = x_248;
      let x_250 : u32 = f;
      let x_252 : u32 = gl_LocalInvocationID.x;
      let x_254 : u32 = val_buf[x_252];
      sorted_val_buf[x_250] = x_254;
    }
    workgroupBarrier();
    let x_257 : u32 = gl_LocalInvocationID.x;
    let x_259 : u32 = gl_LocalInvocationID.x;
    let x_261 : u32 = sorted_key_buf[x_259];
    key_buf[x_257] = x_261;
    let x_264 : u32 = gl_LocalInvocationID.x;
    let x_266 : u32 = gl_LocalInvocationID.x;
    let x_268 : u32 = sorted_val_buf[x_266];
    val_buf[x_264] = x_268;

    continuing {
      let x_270 : u32 = i;
      i = (x_270 + bitcast<u32>(1i));
    }
  }
  workgroupBarrier();
  let x_272 : u32 = item_idx;
  let x_274 : u32 = gl_LocalInvocationID.x;
  let x_276 : u32 = key_buf[x_274];
  x_46.keys[x_272] = x_276;
  let x_278 : u32 = item_idx;
  let x_280 : u32 = gl_LocalInvocationID.x;
  let x_282 : u32 = val_buf[x_280];
  x_58.values[x_278] = x_282;
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>, @builtin(local_invocation_id) gl_LocalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  main_1();
}
`;

const merge_sorted_chunks_comp_spv = `type RTArr = array<u32>;

type RTArr_1 = array<u32>;

struct InputKeys {
  input_keys : RTArr_1,
}

struct BufferInfo {
  size : u32,
}

struct NumWorkGroups {
  work_groups_x : u32,
}

struct PushConstants {
  work_group_offset : u32,
}

type RTArr_2 = array<u32>;

struct OutputKeys {
  output_keys : RTArr_1,
}

type RTArr_3 = array<u32>;

struct OutputValues {
  output_values : RTArr_1,
}

struct InputValues {
  input_values : RTArr_1,
}

@group(1) @binding(0) var<storage, read_write> x_75 : InputKeys;

@group(0) @binding(0) var<uniform> x_132 : BufferInfo;

@group(2) @binding(0) var<uniform> x_149 : NumWorkGroups;

@group(3) @binding(0) var<uniform> x_159 : PushConstants;

var<private> gl_WorkGroupID : vec3<u32>;

var<private> gl_LocalInvocationID : vec3<u32>;

@group(1) @binding(2) var<storage, read_write> x_237 : OutputKeys;

@group(1) @binding(3) var<storage, read_write> x_246 : OutputValues;

@group(1) @binding(1) var<storage, read_write> x_251 : InputValues;

fn next_pow2_u1_(x : ptr<function, u32>) -> u32 {
  let x_23 : u32 = *(x);
  *(x) = (x_23 - 1u);
  let x_26 : u32 = *(x);
  let x_30 : u32 = *(x);
  *(x) = (x_30 | (x_26 >> bitcast<u32>(1i)));
  let x_32 : u32 = *(x);
  let x_35 : u32 = *(x);
  *(x) = (x_35 | (x_32 >> bitcast<u32>(2i)));
  let x_37 : u32 = *(x);
  let x_40 : u32 = *(x);
  *(x) = (x_40 | (x_37 >> bitcast<u32>(4i)));
  let x_42 : u32 = *(x);
  let x_45 : u32 = *(x);
  *(x) = (x_45 | (x_42 >> bitcast<u32>(8i)));
  let x_47 : u32 = *(x);
  let x_50 : u32 = *(x);
  *(x) = (x_50 | (x_47 >> bitcast<u32>(16i)));
  let x_52 : u32 = *(x);
  return (x_52 + 1u);
}

fn upper_bound_u1_u1_u1_(start : ptr<function, u32>, count : ptr<function, u32>, element : ptr<function, u32>) -> u32 {
  var i : u32;
  loop {
    let x_61 : u32 = *(count);
    if ((x_61 > 0u)) {
    } else {
      break;
    }
    let x_66 : u32 = *(start);
    let x_67 : u32 = *(count);
    i = (x_66 + (x_67 / 2u));
    let x_71 : u32 = *(element);
    let x_77 : u32 = i;
    let x_80 : u32 = x_75.input_keys[x_77];
    if ((x_71 >= x_80)) {
      let x_84 : u32 = i;
      *(start) = (x_84 + 1u);
      let x_86 : u32 = *(count);
      let x_89 : u32 = *(count);
      *(count) = (x_89 - ((x_86 / 2u) + 1u));
    } else {
      let x_92 : u32 = *(count);
      *(count) = (x_92 / 2u);
    }
  }
  let x_94 : u32 = *(start);
  return x_94;
}

fn lower_bound_u1_u1_u1_(start_1 : ptr<function, u32>, count_1 : ptr<function, u32>, element_1 : ptr<function, u32>) -> u32 {
  var i_1 : u32;
  loop {
    let x_102 : u32 = *(count_1);
    if ((x_102 > 0u)) {
    } else {
      break;
    }
    let x_105 : u32 = *(start_1);
    let x_106 : u32 = *(count_1);
    i_1 = (x_105 + (x_106 / 2u));
    let x_109 : u32 = i_1;
    let x_111 : u32 = x_75.input_keys[x_109];
    let x_112 : u32 = *(element_1);
    if ((x_111 < x_112)) {
      let x_116 : u32 = i_1;
      *(start_1) = (x_116 + 1u);
      let x_118 : u32 = *(count_1);
      let x_121 : u32 = *(count_1);
      *(count_1) = (x_121 - ((x_118 / 2u) + 1u));
    } else {
      let x_124 : u32 = *(count_1);
      *(count_1) = (x_124 / 2u);
    }
  }
  let x_126 : u32 = *(start_1);
  return x_126;
}

fn main_1() {
  var aligned_size : u32;
  var param : u32;
  var merge_output_size : u32;
  var merge_chunk_size : u32;
  var offs : u32;
  var i_2 : u32;
  var a_in : u32;
  var b_in : u32;
  var base_idx : u32;
  var a_loc : u32;
  var param_1 : u32;
  var param_2 : u32;
  var param_3 : u32;
  var b_loc : u32;
  var param_4 : u32;
  var param_5 : u32;
  var param_6 : u32;
  let x_134 : u32 = x_132.size;
  param = u32(ceil((f32(x_134) / 64.0f)));
  let x_142 : u32 = next_pow2_u1_(&(param));
  aligned_size = (x_142 * 64u);
  let x_146 : u32 = aligned_size;
  let x_151 : u32 = x_149.work_groups_x;
  merge_output_size = (x_146 / x_151);
  let x_154 : u32 = merge_output_size;
  merge_chunk_size = (x_154 / 2u);
  let x_161 : u32 = x_159.work_group_offset;
  let x_167 : u32 = gl_WorkGroupID.x;
  let x_169 : u32 = merge_output_size;
  offs = ((x_161 + x_167) * x_169);
  i_2 = 0u;
  loop {
    let x_177 : u32 = i_2;
    let x_178 : u32 = merge_chunk_size;
    if ((x_177 < (x_178 / 64u))) {
    } else {
      break;
    }
    let x_182 : u32 = offs;
    let x_183 : u32 = i_2;
    let x_188 : u32 = gl_LocalInvocationID.x;
    a_in = ((x_182 + (x_183 * 64u)) + x_188);
    let x_191 : u32 = offs;
    let x_192 : u32 = merge_chunk_size;
    let x_194 : u32 = i_2;
    let x_198 : u32 = gl_LocalInvocationID.x;
    b_in = (((x_191 + x_192) + (x_194 * 64u)) + x_198);
    let x_202 : u32 = gl_LocalInvocationID.x;
    let x_203 : u32 = i_2;
    base_idx = (x_202 + (x_203 * 64u));
    let x_207 : u32 = base_idx;
    let x_208 : u32 = offs;
    let x_209 : u32 = merge_chunk_size;
    let x_211 : u32 = a_in;
    param_1 = (x_208 + x_209);
    let x_214 : u32 = merge_chunk_size;
    param_2 = x_214;
    let x_217 : u32 = x_75.input_keys[x_211];
    param_3 = x_217;
    let x_218 : u32 = upper_bound_u1_u1_u1_(&(param_1), &(param_2), &(param_3));
    let x_220 : u32 = merge_chunk_size;
    a_loc = ((x_207 + x_218) - x_220);
    let x_223 : u32 = base_idx;
    let x_224 : u32 = b_in;
    let x_226 : u32 = offs;
    param_4 = x_226;
    let x_228 : u32 = merge_chunk_size;
    param_5 = x_228;
    let x_231 : u32 = x_75.input_keys[x_224];
    param_6 = x_231;
    let x_232 : u32 = lower_bound_u1_u1_u1_(&(param_4), &(param_5), &(param_6));
    b_loc = (x_223 + x_232);
    let x_238 : u32 = a_loc;
    let x_239 : u32 = a_in;
    let x_241 : u32 = x_75.input_keys[x_239];
    x_237.output_keys[x_238] = x_241;
    let x_247 : u32 = a_loc;
    let x_252 : u32 = a_in;
    let x_254 : u32 = x_251.input_values[x_252];
    x_246.output_values[x_247] = x_254;
    let x_256 : u32 = b_loc;
    let x_257 : u32 = b_in;
    let x_259 : u32 = x_75.input_keys[x_257];
    x_237.output_keys[x_256] = x_259;
    let x_261 : u32 = b_loc;
    let x_262 : u32 = b_in;
    let x_264 : u32 = x_251.input_values[x_262];
    x_246.output_values[x_261] = x_264;

    continuing {
      let x_266 : u32 = i_2;
      i_2 = (x_266 + bitcast<u32>(1i));
    }
  }
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(workgroup_id) gl_WorkGroupID_param : vec3<u32>, @builtin(local_invocation_id) gl_LocalInvocationID_param : vec3<u32>) {
  gl_WorkGroupID = gl_WorkGroupID_param;
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  main_1();
}
`;

const reverse_buffer_comp_spv = `struct BufferInfo {
  size : u32,
}

struct PushConstants {
  work_group_offset : u32,
}

type RTArr = array<u32>;

struct Values {
  values : RTArr,
}

@group(0) @binding(0) var<uniform> x_48 : BufferInfo;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(2) @binding(0) var<uniform> x_84 : PushConstants;

@group(1) @binding(0) var<storage, read_write> x_102 : Values;

fn next_pow2_u1_(x : ptr<function, u32>) -> u32 {
  let x_12 : u32 = *(x);
  *(x) = (x_12 - 1u);
  let x_15 : u32 = *(x);
  let x_19 : u32 = *(x);
  *(x) = (x_19 | (x_15 >> bitcast<u32>(1i)));
  let x_21 : u32 = *(x);
  let x_24 : u32 = *(x);
  *(x) = (x_24 | (x_21 >> bitcast<u32>(2i)));
  let x_26 : u32 = *(x);
  let x_29 : u32 = *(x);
  *(x) = (x_29 | (x_26 >> bitcast<u32>(4i)));
  let x_31 : u32 = *(x);
  let x_34 : u32 = *(x);
  *(x) = (x_34 | (x_31 >> bitcast<u32>(8i)));
  let x_36 : u32 = *(x);
  let x_39 : u32 = *(x);
  *(x) = (x_39 | (x_36 >> bitcast<u32>(16i)));
  let x_41 : u32 = *(x);
  return (x_41 + 1u);
}

fn main_1() {
  var aligned_size : u32;
  var param : u32;
  var idx : u32;
  var i : u32;
  var j : u32;
  var tmp : u32;
  var x_76 : bool;
  var x_77 : bool;
  let x_52 : u32 = x_48.size;
  param = u32(ceil((f32(x_52) / 64.0f)));
  let x_60 : u32 = next_pow2_u1_(&(param));
  aligned_size = (x_60 * 64u);
  let x_64 : u32 = aligned_size;
  let x_65 : bool = (x_64 < 64u);
  x_77 = x_65;
  if (x_65) {
    let x_74 : u32 = gl_GlobalInvocationID.x;
    x_76 = (x_74 > 32u);
    x_77 = x_76;
  }
  if (x_77) {
    return;
  }
  let x_86 : u32 = x_84.work_group_offset;
  let x_89 : u32 = gl_GlobalInvocationID.x;
  idx = ((x_86 * 64u) + x_89);
  let x_92 : u32 = idx;
  i = x_92;
  let x_94 : u32 = aligned_size;
  let x_95 : u32 = idx;
  j = ((x_94 - x_95) - 1u);
  let x_103 : u32 = i;
  let x_105 : u32 = x_102.values[x_103];
  tmp = x_105;
  let x_106 : u32 = i;
  let x_107 : u32 = j;
  let x_109 : u32 = x_102.values[x_107];
  x_102.values[x_106] = x_109;
  let x_111 : u32 = j;
  let x_112 : u32 = tmp;
  x_102.values[x_111] = x_112;
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

