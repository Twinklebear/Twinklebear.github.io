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
  d = 256;
  loop {
    let x_57 : i32 = d;
    if ((x_57 > 0)) {
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
    offs = (x_92 << bitcast<u32>(1));

    continuing {
      let x_95 : i32 = d;
      d = (x_95 >> bitcast<u32>(1));
    }
  }
  let x_98 : u32 = gl_LocalInvocationID.x;
  if ((x_98 == 0u)) {
    let x_108 : u32 = gl_WorkGroupID.x;
    let x_111 : u32 = chunk[511];
    x_105.block_sums[x_108] = x_111;
    chunk[511] = 0u;
  }
  d_1 = 1;
  loop {
    let x_120 : i32 = d_1;
    if ((x_120 < 512)) {
    } else {
      break;
    }
    let x_123 : u32 = offs;
    offs = (x_123 >> bitcast<u32>(1));
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
      d_1 = (x_163 << bitcast<u32>(1));
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

@stage(compute) @workgroup_size(256, 1, 1)
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
  d = 256;
  loop {
    let x_57 : i32 = d;
    if ((x_57 > 0)) {
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
    offs = (x_92 << bitcast<u32>(1));

    continuing {
      let x_95 : i32 = d;
      d = (x_95 >> bitcast<u32>(1));
    }
  }
  let x_98 : u32 = gl_LocalInvocationID.x;
  if ((x_98 == 0u)) {
    let x_107 : u32 = chunk[511];
    let x_109 : u32 = x_104.carry_in;
    x_104.carry_out = (x_107 + x_109);
    chunk[511] = 0u;
  }
  d_1 = 1;
  loop {
    let x_119 : i32 = d_1;
    if ((x_119 < 512)) {
    } else {
      break;
    }
    let x_122 : u32 = offs;
    offs = (x_122 >> bitcast<u32>(1));
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
      d_1 = (x_162 << bitcast<u32>(1));
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

@stage(compute) @workgroup_size(256, 1, 1)
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

@stage(compute) @workgroup_size(256, 1, 1)
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

@stage(compute) @workgroup_size(1, 1, 1)
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

@group(0) @binding(0) var<uniform> x_134 : ViewParams;

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
  quantized = vec3<f32>(f32(((x_21 & 1072693248u) >> bitcast<u32>(20))), f32(((x_28 & 1047552u) >> bitcast<u32>(10))), f32((x_34 & 1023u)));
  let x_39 : vec3<f32> = quantized;
  return (((x_39 * 4.0) / vec3<f32>(1023.0, 1023.0, 1023.0)) + vec3<f32>(0.5, 0.5, 0.5));
}

fn main_1() {
  var block_pos : vec3<f32>;
  var param : u32;
  var param_1 : u32;
  let x_94 : u32 = pos.y;
  param = x_94;
  let x_96 : vec3<u32> = block_id_to_pos_u1_(&(param));
  block_pos = (vec3<f32>(x_96) * 4.0);
  let x_101 : vec3<f32> = block_pos;
  let x_104 : u32 = pos.x;
  param_1 = x_104;
  let x_105 : vec3<f32> = decompress_position_u1_(&(param_1));
  let x_106 : vec3<f32> = (x_101 + x_105);
  let x_107 : vec4<f32> = world_pos;
  world_pos = vec4<f32>(x_106.x, x_106.y, x_106.z, x_107.w);
  let x_112 : vec4<f32> = x_56.volume_scale;
  let x_114 : vec4<f32> = world_pos;
  let x_118 : vec4<u32> = x_56.volume_dims;
  let x_124 : vec3<f32> = (vec3<f32>(x_112.x, x_112.y, x_112.z) * ((vec3<f32>(x_114.x, x_114.y, x_114.z) / vec3<f32>(vec3<u32>(x_118.x, x_118.y, x_118.z))) - vec3<f32>(0.5, 0.5, 0.5)));
  let x_125 : vec4<f32> = world_pos;
  world_pos = vec4<f32>(x_124.x, x_124.y, x_124.z, x_125.w);
  let x_137 : mat4x4<f32> = x_134.proj_view;
  let x_138 : vec4<f32> = world_pos;
  let x_139 : vec3<f32> = vec3<f32>(x_138.x, x_138.y, x_138.z);
  gl_Position = (x_137 * vec4<f32>(x_139.x, x_139.y, x_139.z, 1.0));
  return;
}

struct main_out {
  @location(0)
  world_pos_1 : vec4<f32>,
  @builtin(position)
  gl_Position : vec4<f32>,
}

@stage(vertex)
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
  if ((dot(x_44, x_45) < 0.0)) {
    let x_52 : vec3<f32> = n;
    n = -(x_52);
  }
  base_color = vec3<f32>(0.300000012, 0.300000012, 0.899999976);
  let x_59 : vec3<f32> = v;
  let x_60 : vec3<f32> = light_dir;
  h = normalize((x_59 + x_60));
  let x_65 : vec3<f32> = base_color;
  let x_67 : vec3<f32> = (x_65 * 0.200000003);
  let x_68 : vec4<f32> = color;
  color = vec4<f32>(x_67.x, x_67.y, x_67.z, x_68.w);
  let x_71 : vec3<f32> = light_dir;
  let x_72 : vec3<f32> = n;
  let x_77 : vec3<f32> = base_color;
  let x_79 : vec4<f32> = color;
  let x_81 : vec3<f32> = (vec3<f32>(x_79.x, x_79.y, x_79.z) + (x_77 * (0.600000024 * clamp(dot(x_71, x_72), 0.0, 1.0))));
  let x_82 : vec4<f32> = color;
  color = vec4<f32>(x_81.x, x_81.y, x_81.z, x_82.w);
  let x_85 : vec3<f32> = n;
  let x_86 : vec3<f32> = h;
  let x_91 : f32 = (0.100000001 * pow(clamp(dot(x_85, x_86), 0.0, 1.0), 5.0));
  let x_92 : vec4<f32> = color;
  let x_95 : vec3<f32> = (vec3<f32>(x_92.x, x_92.y, x_92.z) + vec3<f32>(x_91, x_91, x_91));
  let x_96 : vec4<f32> = color;
  color = vec4<f32>(x_95.x, x_95.y, x_95.z, x_96.w);
  color.w = 1.0;
  return;
}

struct main_out {
  @location(0)
  color_1 : vec4<f32>,
}

@stage(fragment)
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
  (*(reader)).current_word = (x_284 + bitcast<u32>(1));
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
  (*(reader_1)).current_bit = (x_301 + bitcast<u32>(1));
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
      i = (x_400 + bitcast<u32>(1));
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
    var x_425_phi : bool;
    let x_418 : u32 = bits_1;
    let x_419 : bool = (x_418 != 0u);
    x_425_phi = x_419;
    if (x_419) {
      let x_422 : u32 = k;
      k = (x_422 - bitcast<u32>(1));
      x_424 = (x_422 > 0u);
      x_425_phi = x_424;
    }
    let x_425 : bool = x_425_phi;
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
      var x_457_phi : bool;
      let x_443 : u32 = n_3;
      let x_445 : u32 = bits_1;
      let x_447 : bool = ((x_443 < 64u) & (x_445 != 0u));
      x_457_phi = x_447;
      if (x_447) {
        let x_450 : u32 = bits_1;
        bits_1 = (x_450 - bitcast<u32>(1));
        let x_453 : BlockReader = *(reader_3);
        param_16 = x_453;
        let x_454 : u32 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_16));
        let x_455 : BlockReader = param_16;
        *(reader_3) = x_455;
        x_456 = (x_454 != 0u);
        x_457_phi = x_456;
      }
      let x_457 : bool = x_457_phi;
      if (x_457) {
      } else {
        break;
      }
      loop {
        var x_477 : bool;
        var x_478_phi : bool;
        let x_463 : u32 = n_3;
        let x_466 : u32 = bits_1;
        let x_468 : bool = ((x_463 < 63u) & (x_466 != 0u));
        x_478_phi = x_468;
        if (x_468) {
          let x_471 : u32 = bits_1;
          bits_1 = (x_471 - bitcast<u32>(1));
          let x_474 : BlockReader = *(reader_3);
          param_17 = x_474;
          let x_475 : u32 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_17));
          let x_476 : BlockReader = param_17;
          *(reader_3) = x_476;
          x_477 = (x_475 == 0u);
          x_478_phi = x_477;
        }
        let x_478 : bool = x_478_phi;
        if (x_478) {
        } else {
          break;
        }

        continuing {
          let x_479 : u32 = n_3;
          n_3 = (x_479 + bitcast<u32>(1));
        }
      }

      continuing {
        let x_481 : EmulateUint64 = x_1;
        let x_482 : EmulateUint64 = one;
        let x_483 : u32 = n_3;
        n_3 = (x_483 + bitcast<u32>(1));
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
        i_1 = (x_506 + bitcast<u32>(1));
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
      i_2 = (x_531 + bitcast<u32>(1));
    }
  }
  let x_535 : i32 = v.w;
  let x_538 : i32 = v.y;
  v.y = (x_538 + (x_535 >> bitcast<u32>(1)));
  let x_542 : i32 = v.y;
  let x_545 : i32 = v.w;
  v.w = (x_545 - (x_542 >> bitcast<u32>(1)));
  let x_549 : i32 = v.w;
  let x_551 : i32 = v.y;
  v.y = (x_551 + x_549);
  let x_555 : i32 = v.w;
  v.w = (x_555 << bitcast<u32>(1));
  let x_559 : i32 = v.y;
  let x_561 : i32 = v.w;
  v.w = (x_561 - x_559);
  let x_565 : i32 = v.x;
  let x_568 : i32 = v.z;
  v.z = (x_568 + x_565);
  let x_572 : i32 = v.x;
  v.x = (x_572 << bitcast<u32>(1));
  let x_576 : i32 = v.z;
  let x_578 : i32 = v.x;
  v.x = (x_578 - x_576);
  let x_582 : i32 = v.z;
  let x_584 : i32 = v.y;
  v.y = (x_584 + x_582);
  let x_588 : i32 = v.z;
  v.z = (x_588 << bitcast<u32>(1));
  let x_592 : i32 = v.y;
  let x_594 : i32 = v.z;
  v.z = (x_594 - x_592);
  let x_598 : i32 = v.x;
  let x_600 : i32 = v.w;
  v.w = (x_600 + x_598);
  let x_604 : i32 = v.x;
  v.x = (x_604 << bitcast<u32>(1));
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
      i_3 = (x_628 + bitcast<u32>(1));
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
        x_2 = (x_655 + bitcast<u32>(1));
      }
    }

    continuing {
      let x_657 : u32 = y;
      y = (x_657 + bitcast<u32>(1));
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
        z = (x_683 + bitcast<u32>(1));
      }
    }

    continuing {
      let x_685 : u32 = x_3;
      x_3 = (x_685 + bitcast<u32>(1));
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
        y_1 = (x_712 + bitcast<u32>(1));
      }
    }

    continuing {
      let x_714 : u32 = z_1;
      z_1 = (x_714 + bitcast<u32>(1));
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
        i_4 = (x_823 + bitcast<u32>(1));
      }
    }
    let x_826 : array<i32, 64u> = int_block;
    param_28 = x_826;
    inverse_transform_i1_64__(&(param_28));
    let x_828 : array<i32, 64u> = param_28;
    int_block = x_828;
    let x_832 : i32 = emax;
    inv_w = ldexp(1.0, (x_832 - 30));
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
        i_5 = (x_852 + bitcast<u32>(1));
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
  nblocks.x = (x_907 >> bitcast<u32>(2));
  let x_911 : u32 = x_242.padded_dims.y;
  nblocks.y = (x_911 >> bitcast<u32>(2));
  let x_915 : u32 = x_242.padded_dims.z;
  nblocks.z = (x_915 >> bitcast<u32>(2));
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
  block_range = vec2<f32>(100000002004087734272.0, -100000002004087734272.0);
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
          x_4 = (x_1055 + bitcast<u32>(1));
        }
      }

      continuing {
        let x_1057 : u32 = y_2;
        y_2 = (x_1057 + bitcast<u32>(1));
      }
    }

    continuing {
      let x_1059 : u32 = z_2;
      z_2 = (x_1059 + bitcast<u32>(1));
    }
  }
  let x_1065 : u32 = block_index_1;
  let x_1066 : vec2<f32> = block_range;
  x_1064.block_ranges[x_1065] = x_1066;
  return;
}

@stage(compute) @workgroup_size(32, 1, 1)
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
  (*(reader)).current_word = (x_284 + bitcast<u32>(1));
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
  (*(reader_1)).current_bit = (x_301 + bitcast<u32>(1));
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
      i = (x_400 + bitcast<u32>(1));
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
    var x_425_phi : bool;
    let x_418 : u32 = bits_1;
    let x_419 : bool = (x_418 != 0u);
    x_425_phi = x_419;
    if (x_419) {
      let x_422 : u32 = k;
      k = (x_422 - bitcast<u32>(1));
      x_424 = (x_422 > 0u);
      x_425_phi = x_424;
    }
    let x_425 : bool = x_425_phi;
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
      var x_457_phi : bool;
      let x_443 : u32 = n_3;
      let x_445 : u32 = bits_1;
      let x_447 : bool = ((x_443 < 64u) & (x_445 != 0u));
      x_457_phi = x_447;
      if (x_447) {
        let x_450 : u32 = bits_1;
        bits_1 = (x_450 - bitcast<u32>(1));
        let x_453 : BlockReader = *(reader_3);
        param_16 = x_453;
        let x_454 : u32 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_16));
        let x_455 : BlockReader = param_16;
        *(reader_3) = x_455;
        x_456 = (x_454 != 0u);
        x_457_phi = x_456;
      }
      let x_457 : bool = x_457_phi;
      if (x_457) {
      } else {
        break;
      }
      loop {
        var x_477 : bool;
        var x_478_phi : bool;
        let x_463 : u32 = n_3;
        let x_466 : u32 = bits_1;
        let x_468 : bool = ((x_463 < 63u) & (x_466 != 0u));
        x_478_phi = x_468;
        if (x_468) {
          let x_471 : u32 = bits_1;
          bits_1 = (x_471 - bitcast<u32>(1));
          let x_474 : BlockReader = *(reader_3);
          param_17 = x_474;
          let x_475 : u32 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_17));
          let x_476 : BlockReader = param_17;
          *(reader_3) = x_476;
          x_477 = (x_475 == 0u);
          x_478_phi = x_477;
        }
        let x_478 : bool = x_478_phi;
        if (x_478) {
        } else {
          break;
        }

        continuing {
          let x_479 : u32 = n_3;
          n_3 = (x_479 + bitcast<u32>(1));
        }
      }

      continuing {
        let x_481 : EmulateUint64 = x_1;
        let x_482 : EmulateUint64 = one;
        let x_483 : u32 = n_3;
        n_3 = (x_483 + bitcast<u32>(1));
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
        i_1 = (x_506 + bitcast<u32>(1));
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
      i_2 = (x_531 + bitcast<u32>(1));
    }
  }
  let x_535 : i32 = v.w;
  let x_538 : i32 = v.y;
  v.y = (x_538 + (x_535 >> bitcast<u32>(1)));
  let x_542 : i32 = v.y;
  let x_545 : i32 = v.w;
  v.w = (x_545 - (x_542 >> bitcast<u32>(1)));
  let x_549 : i32 = v.w;
  let x_551 : i32 = v.y;
  v.y = (x_551 + x_549);
  let x_555 : i32 = v.w;
  v.w = (x_555 << bitcast<u32>(1));
  let x_559 : i32 = v.y;
  let x_561 : i32 = v.w;
  v.w = (x_561 - x_559);
  let x_565 : i32 = v.x;
  let x_568 : i32 = v.z;
  v.z = (x_568 + x_565);
  let x_572 : i32 = v.x;
  v.x = (x_572 << bitcast<u32>(1));
  let x_576 : i32 = v.z;
  let x_578 : i32 = v.x;
  v.x = (x_578 - x_576);
  let x_582 : i32 = v.z;
  let x_584 : i32 = v.y;
  v.y = (x_584 + x_582);
  let x_588 : i32 = v.z;
  v.z = (x_588 << bitcast<u32>(1));
  let x_592 : i32 = v.y;
  let x_594 : i32 = v.z;
  v.z = (x_594 - x_592);
  let x_598 : i32 = v.x;
  let x_600 : i32 = v.w;
  v.w = (x_600 + x_598);
  let x_604 : i32 = v.x;
  v.x = (x_604 << bitcast<u32>(1));
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
      i_3 = (x_628 + bitcast<u32>(1));
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
        x_2 = (x_655 + bitcast<u32>(1));
      }
    }

    continuing {
      let x_657 : u32 = y;
      y = (x_657 + bitcast<u32>(1));
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
        z = (x_683 + bitcast<u32>(1));
      }
    }

    continuing {
      let x_685 : u32 = x_3;
      x_3 = (x_685 + bitcast<u32>(1));
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
        y_1 = (x_712 + bitcast<u32>(1));
      }
    }

    continuing {
      let x_714 : u32 = z_1;
      z_1 = (x_714 + bitcast<u32>(1));
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
        i_4 = (x_823 + bitcast<u32>(1));
      }
    }
    let x_826 : array<i32, 64u> = int_block;
    param_28 = x_826;
    inverse_transform_i1_64__(&(param_28));
    let x_828 : array<i32, 64u> = param_28;
    int_block = x_828;
    let x_832 : i32 = emax;
    inv_w = ldexp(1.0, (x_832 - 30));
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
        i_5 = (x_852 + bitcast<u32>(1));
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
      i_6 = (x_913 + bitcast<u32>(1));
    }
  }
  return;
}

@stage(compute) @workgroup_size(1, 1, 1)
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
  var x_82_phi : bool;
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
  x_82_phi = x_74;
  if (x_74) {
    let x_78 : f32 = x_15.isovalue;
    let x_80 : f32 = range.y;
    x_81 = (x_78 <= x_80);
    x_82_phi = x_81;
  }
  let x_82 : bool = x_82_phi;
  if (x_82) {
    let x_85 : u32 = block_id;
    x_50.block_active[x_85] = 1u;
  } else {
    k = -1;
    loop {
      let x_96 : i32 = k;
      if ((x_96 < 2)) {
      } else {
        break;
      }
      j = -1;
      loop {
        let x_105 : i32 = j;
        if ((x_105 < 2)) {
        } else {
          break;
        }
        i = -1;
        loop {
          var x_137 : bool;
          var x_146 : bool;
          var x_195 : bool;
          var x_138_phi : bool;
          var x_147_phi : bool;
          var x_196_phi : bool;
          let x_113 : i32 = i;
          if ((x_113 < 2)) {
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
          let x_131 : bool = all((x_127 == vec3<i32>(0, 0, 0)));
          x_138_phi = x_131;
          if (!(x_131)) {
            let x_135 : vec3<i32> = coords;
            x_137 = any((x_135 < vec3<i32>(0, 0, 0)));
            x_138_phi = x_137;
          }
          let x_138 : bool = x_138_phi;
          x_147_phi = x_138;
          if (!(x_138)) {
            let x_142 : vec3<i32> = coords;
            let x_144 : vec3<u32> = n_blocks;
            x_146 = any((bitcast<vec3<u32>>(x_142) >= x_144));
            x_147_phi = x_146;
          }
          let x_147 : bool = x_147_phi;
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
          x_196_phi = x_188;
          if (x_188) {
            let x_192 : f32 = x_15.isovalue;
            let x_194 : f32 = union_range.y;
            x_195 = (x_192 <= x_194);
            x_196_phi = x_195;
          }
          let x_196 : bool = x_196_phi;
          if (x_196) {
            let x_199 : u32 = block_id;
            x_50.block_active[x_199] = 1u;
            return;
          }

          continuing {
            let x_202 : i32 = i;
            i = (x_202 + 1);
          }
        }

        continuing {
          let x_204 : i32 = j;
          j = (x_204 + 1);
        }
      }

      continuing {
        let x_206 : i32 = k;
        k = (x_206 + 1);
      }
    }
  }
  return;
}

@stage(compute) @workgroup_size(1, 1, 1)
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

@group(0) @binding(4) var<storage, read_write> x_382 : BlockLocations;

@group(0) @binding(2) var<storage, read_write> x_397 : Decompressed;

var<private> gl_LocalInvocationID : vec3<u32>;

var<workgroup> voxel_vertices : array<u32, 64u>;

var<private> gl_WorkGroupID : vec3<u32>;

@group(1) @binding(1) var<uniform> x_652 : BlockIDOffset;

@group(0) @binding(5) var<storage, read_write> x_660 : BlockIDs;

@group(0) @binding(1) var<uniform> x_721 : TriTable;

@group(1) @binding(0) var<storage, read_write> x_762 : BlockHasVertices;

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
      let x_284 : vec3<u32> = block_dims_3;
      block_dims_3 = vec3<u32>(vec2<u32>(4u, 4u).x, vec2<u32>(4u, 4u).y, x_284.z);
    }
  }
  let x_286 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_286.x, x_286.z) == vec2<u32>(5u, 5u)))) {
    param_2 = (block_pos_1 + vec3<u32>(1u, 0u, 1u));
    let x_296 : u32 = compute_block_id_vu3_(&(param_2));
    edge_1 = x_296;
    let x_297 : u32 = edge_1;
    let x_299 : u32 = x_255.block_active[x_297];
    if ((x_299 == 0u)) {
      let x_303 : vec3<u32> = block_dims_3;
      block_dims_3 = vec3<u32>(vec2<u32>(4u, 4u).x, x_303.y, vec2<u32>(4u, 4u).y);
    }
  }
  let x_305 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_305.y, x_305.z) == vec2<u32>(5u, 5u)))) {
    param_3 = (block_pos_1 + vec3<u32>(0u, 1u, 1u));
    let x_315 : u32 = compute_block_id_vu3_(&(param_3));
    edge_2 = x_315;
    let x_316 : u32 = edge_2;
    let x_318 : u32 = x_255.block_active[x_316];
    if ((x_318 == 0u)) {
      let x_322 : vec3<u32> = block_dims_3;
      block_dims_3 = vec3<u32>(x_322.x, vec2<u32>(4u, 4u).x, vec2<u32>(4u, 4u).y);
    }
  }
  let x_325 : u32 = block_dims_3.x;
  if ((x_325 == 5u)) {
    param_4 = (block_pos_1 + vec3<u32>(1u, 0u, 0u));
    let x_333 : u32 = compute_block_id_vu3_(&(param_4));
    face = x_333;
    let x_334 : u32 = face;
    let x_336 : u32 = x_255.block_active[x_334];
    if ((x_336 == 0u)) {
      block_dims_3.x = 4u;
    }
  }
  let x_342 : u32 = block_dims_3.y;
  if ((x_342 == 5u)) {
    param_5 = (block_pos_1 + vec3<u32>(0u, 1u, 0u));
    let x_350 : u32 = compute_block_id_vu3_(&(param_5));
    face_1 = x_350;
    let x_351 : u32 = face_1;
    let x_353 : u32 = x_255.block_active[x_351];
    if ((x_353 == 0u)) {
      block_dims_3.y = 4u;
    }
  }
  let x_359 : u32 = block_dims_3.z;
  if ((x_359 == 5u)) {
    param_6 = (block_pos_1 + vec3<u32>(0u, 0u, 1u));
    let x_367 : u32 = compute_block_id_vu3_(&(param_6));
    face_2 = x_367;
    let x_368 : u32 = face_2;
    let x_370 : u32 = x_255.block_active[x_368];
    if ((x_370 == 0u)) {
      block_dims_3.z = 4u;
    }
  }
  let x_375 : vec3<u32> = block_dims_3;
  return x_375;
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
  let x_384 : u32 = x_382.block_locations[neighbor_id];
  neighbor_location = x_384;
  param_7 = ghost_voxel_pos;
  param_8 = block_dims_2;
  let x_388 : u32 = compute_voxel_id_vu3_vu3_(&(param_7), &(param_8));
  ghost_voxel_id = x_388;
  param_9 = neighbor_voxel_pos;
  param_10 = vec3<u32>(4u, 4u, 4u);
  let x_392 : u32 = compute_voxel_id_vu3_vu3_(&(param_9), &(param_10));
  neighbor_voxel_id = x_392;
  let x_393 : u32 = ghost_voxel_id;
  let x_398 : u32 = neighbor_location;
  let x_401 : u32 = neighbor_voxel_id;
  let x_405 : f32 = x_397.decompressed[((x_398 * 64u) + x_401)];
  volume_block[x_393] = x_405;
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
  let x_411 : u32 = gl_LocalInvocationID.x;
  volume_block[(x_411 * 2u)] = 0.0;
  let x_416 : u32 = gl_LocalInvocationID.x;
  volume_block[((x_416 * 2u) + 1u)] = 0.0;
  let x_424 : u32 = gl_LocalInvocationID.x;
  voxel_vertices[x_424] = 0u;
  workgroupBarrier();
  param_11 = block_id;
  let x_430 : vec3<u32> = block_id_to_pos_u1_(&(param_11));
  block_pos_2 = x_430;
  let x_433 : vec4<u32> = x_54.padded_dims;
  n_blocks_3 = (vec3<u32>(x_433.x, x_433.y, x_433.z) / vec3<u32>(4u, 4u, 4u));
  let x_437 : vec3<u32> = block_pos_2;
  let x_438 : vec3<u32> = compute_block_dims_with_ghost_vu3_(x_437);
  block_dims_4 = x_438;
  let x_442 : u32 = gl_LocalInvocationID.x;
  param_12 = x_442;
  let x_443 : vec3<u32> = voxel_id_to_voxel_u1_(&(param_12));
  voxel_pos_2 = x_443;
  let x_444 : vec3<u32> = voxel_pos_2;
  let x_445 : vec3<u32> = voxel_pos_2;
  let x_446 : vec3<u32> = block_dims_4;
  load_voxel_u1_vu3_vu3_vu3_(block_id, x_444, x_445, x_446);
  i_1 = 0u;
  loop {
    var x_466 : bool;
    var x_467_phi : bool;
    let x_454 : u32 = i_1;
    if ((x_454 < 3u)) {
    } else {
      break;
    }
    let x_457 : u32 = i_1;
    let x_459 : u32 = block_dims_4[x_457];
    let x_460 : bool = (x_459 == 5u);
    x_467_phi = x_460;
    if (x_460) {
      let x_463 : u32 = i_1;
      let x_465 : u32 = voxel_pos_2[x_463];
      x_466 = (x_465 == 3u);
      x_467_phi = x_466;
    }
    let x_467 : bool = x_467_phi;
    if (x_467) {
      let x_471 : vec3<u32> = voxel_pos_2;
      let x_474 : u32 = i_1;
      indexable_1 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_478 : vec3<u32> = indexable_1[x_474];
      ghost_voxel_pos_1 = (x_471 + x_478);
      let x_481 : vec3<u32> = ghost_voxel_pos_1;
      neighbor_voxel_pos_1 = x_481;
      let x_482 : u32 = i_1;
      indexable_2 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_485 : u32 = indexable_2[x_482].x;
      if ((x_485 == 1u)) {
        neighbor_voxel_pos_1.x = 0u;
      } else {
        let x_491 : u32 = i_1;
        indexable_3 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
        let x_494 : u32 = indexable_3[x_491].y;
        if ((x_494 == 1u)) {
          neighbor_voxel_pos_1.y = 0u;
        } else {
          neighbor_voxel_pos_1.z = 0u;
        }
      }
      let x_502 : vec3<u32> = block_pos_2;
      let x_503 : u32 = i_1;
      indexable_4 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_506 : vec3<u32> = indexable_4[x_503];
      neighbor_block_pos = (x_502 + x_506);
      let x_510 : vec3<u32> = neighbor_block_pos;
      param_13 = x_510;
      let x_511 : u32 = compute_block_id_vu3_(&(param_13));
      neighbor_id_1 = x_511;
      let x_512 : u32 = neighbor_id_1;
      let x_513 : vec3<u32> = ghost_voxel_pos_1;
      let x_514 : vec3<u32> = neighbor_voxel_pos_1;
      let x_515 : vec3<u32> = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_512, x_513, x_514, x_515);
    }

    continuing {
      let x_517 : u32 = i_1;
      i_1 = (x_517 + bitcast<u32>(1));
    }
  }
  i_2 = 0u;
  loop {
    var x_563 : bool;
    var x_564_phi : bool;
    let x_525 : u32 = i_2;
    if ((x_525 < 3u)) {
    } else {
      break;
    }
    let x_528 : vec3<u32> = block_dims_4;
    let x_530 : u32 = i_2;
    indexable_5 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
    let x_533 : vec3<u32> = indexable_5[x_530];
    b = (x_528 * x_533);
    let x_536 : vec3<u32> = voxel_pos_2;
    let x_537 : u32 = i_2;
    indexable_6 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
    let x_540 : vec3<u32> = indexable_6[x_537];
    p = (x_536 * x_540);
    let x_543 : u32 = b.x;
    let x_545 : u32 = b.y;
    let x_548 : u32 = b.z;
    let x_551 : bool = (((x_543 + x_545) + x_548) == 10u);
    x_564_phi = x_551;
    if (x_551) {
      let x_555 : u32 = p.x;
      let x_557 : u32 = p.y;
      let x_560 : u32 = p.z;
      x_563 = (((x_555 + x_557) + x_560) == 6u);
      x_564_phi = x_563;
    }
    let x_564 : bool = x_564_phi;
    if (x_564) {
      let x_568 : vec3<u32> = voxel_pos_2;
      let x_569 : u32 = i_2;
      indexable_7 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_572 : vec3<u32> = indexable_7[x_569];
      ghost_voxel_pos_2 = (x_568 + x_572);
      let x_575 : vec3<u32> = ghost_voxel_pos_2;
      neighbor_voxel_pos_2 = x_575;
      let x_576 : u32 = i_2;
      indexable_8 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_579 : u32 = indexable_8[x_576].x;
      if ((x_579 == 1u)) {
        neighbor_voxel_pos_2.x = 0u;
      }
      let x_584 : u32 = i_2;
      indexable_9 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_587 : u32 = indexable_9[x_584].y;
      if ((x_587 == 1u)) {
        neighbor_voxel_pos_2.y = 0u;
      }
      let x_592 : u32 = i_2;
      indexable_10 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_595 : u32 = indexable_10[x_592].z;
      if ((x_595 == 1u)) {
        neighbor_voxel_pos_2.z = 0u;
      }
      let x_601 : vec3<u32> = block_pos_2;
      let x_602 : u32 = i_2;
      indexable_11 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_605 : vec3<u32> = indexable_11[x_602];
      neighbor_block_pos_1 = (x_601 + x_605);
      let x_609 : vec3<u32> = neighbor_block_pos_1;
      param_14 = x_609;
      let x_610 : u32 = compute_block_id_vu3_(&(param_14));
      neighbor_id_2 = x_610;
      let x_611 : u32 = neighbor_id_2;
      let x_612 : vec3<u32> = ghost_voxel_pos_2;
      let x_613 : vec3<u32> = neighbor_voxel_pos_2;
      let x_614 : vec3<u32> = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_611, x_612, x_613, x_614);
    }

    continuing {
      let x_616 : u32 = i_2;
      i_2 = (x_616 + bitcast<u32>(1));
    }
  }
  let x_618 : vec3<u32> = block_dims_4;
  let x_621 : vec3<u32> = voxel_pos_2;
  if ((all((x_618 == vec3<u32>(5u, 5u, 5u))) & all((x_621 == vec3<u32>(3u, 3u, 3u))))) {
    let x_629 : vec3<u32> = voxel_pos_2;
    ghost_voxel_pos_3 = (x_629 + vec3<u32>(1u, 1u, 1u));
    let x_632 : vec3<u32> = block_pos_2;
    neighbor_block_pos_2 = (x_632 + vec3<u32>(1u, 1u, 1u));
    let x_636 : vec3<u32> = neighbor_block_pos_2;
    param_15 = x_636;
    let x_637 : u32 = compute_block_id_vu3_(&(param_15));
    neighbor_id_3 = x_637;
    let x_638 : u32 = neighbor_id_3;
    let x_639 : vec3<u32> = ghost_voxel_pos_3;
    let x_641 : vec3<u32> = block_dims_4;
    load_voxel_u1_vu3_vu3_vu3_(x_638, x_639, vec3<u32>(0u, 0u, 0u), x_641);
  }
  workgroupBarrier();
  let x_643 : vec3<u32> = block_dims_4;
  return x_643;
}

fn compute_vertex_values_vu3_vu3_(voxel_pos_1 : ptr<function, vec3<u32>>, block_dims_1 : ptr<function, vec3<u32>>) -> array<f32, 8u> {
  var i : i32;
  var v : vec3<u32>;
  var indexable : array<vec3<i32>, 8u>;
  var voxel : u32;
  var values : array<f32, 8u>;
  i = 0;
  loop {
    let x_144 : i32 = i;
    if ((x_144 < 8)) {
    } else {
      break;
    }
    let x_160 : i32 = i;
    indexable = array<vec3<i32>, 8u>(vec3<i32>(0, 0, 0), vec3<i32>(1, 0, 0), vec3<i32>(1, 1, 0), vec3<i32>(0, 1, 0), vec3<i32>(0, 0, 1), vec3<i32>(1, 0, 1), vec3<i32>(1, 1, 1), vec3<i32>(0, 1, 1));
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
      i = (x_204 + 1);
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
  let x_649 : u32 = gl_WorkGroupID.x;
  let x_654 : u32 = x_652.block_id_offset;
  work_item = (x_649 + x_654);
  let x_661 : u32 = work_item;
  let x_663 : u32 = x_660.block_ids[x_661];
  block_id_1 = x_663;
  let x_665 : u32 = block_id_1;
  let x_666 : vec3<u32> = load_block_u1_(x_665);
  block_dims_5 = x_666;
  let x_670 : u32 = gl_LocalInvocationID.x;
  param_16 = x_670;
  let x_671 : vec3<u32> = voxel_id_to_voxel_u1_(&(param_16));
  voxel_pos_3 = x_671;
  nverts = 0u;
  let x_673 : vec3<u32> = voxel_pos_3;
  let x_675 : vec3<u32> = block_dims_5;
  if (all(((x_673 + vec3<u32>(1u, 1u, 1u)) < x_675))) {
    let x_682 : vec3<u32> = voxel_pos_3;
    param_17 = x_682;
    let x_684 : vec3<u32> = block_dims_5;
    param_18 = x_684;
    let x_685 : array<f32, 8u> = compute_vertex_values_vu3_vu3_(&(param_17), &(param_18));
    values_1 = x_685;
    case_index = 0u;
    i_3 = 0;
    loop {
      let x_693 : i32 = i_3;
      if ((x_693 < 8)) {
      } else {
        break;
      }
      let x_695 : i32 = i_3;
      let x_697 : f32 = values_1[x_695];
      let x_700 : f32 = x_54.isovalue;
      if ((x_697 <= x_700)) {
        let x_704 : i32 = i_3;
        let x_707 : u32 = case_index;
        case_index = (x_707 | bitcast<u32>((1 << bitcast<u32>(x_704))));
      }

      continuing {
        let x_709 : i32 = i_3;
        i_3 = (x_709 + 1);
      }
    }
    let x_712 : u32 = case_index;
    chunk = (x_712 * 4u);
    let x_722 : u32 = chunk;
    let x_725 : vec4<i32> = x_721.tri_table[x_722];
    table_chunk = x_725;
    t = 0u;
    loop {
      let x_732 : u32 = t;
      let x_734 : i32 = table_chunk[x_732];
      if ((x_734 != -1)) {
      } else {
        break;
      }
      let x_737 : u32 = nverts;
      nverts = (x_737 + bitcast<u32>(1));
      let x_739 : u32 = t;
      if ((x_739 == 3u)) {
        let x_743 : u32 = chunk;
        let x_744 : u32 = (x_743 + bitcast<u32>(1));
        chunk = x_744;
        let x_746 : vec4<i32> = x_721.tri_table[x_744];
        table_chunk = x_746;
        t = 0u;
      } else {
        let x_748 : u32 = t;
        t = (x_748 + bitcast<u32>(1));
      }
    }
  }
  let x_751 : u32 = gl_LocalInvocationID.x;
  let x_752 : u32 = nverts;
  voxel_vertices[x_751] = x_752;
  workgroupBarrier();
  let x_755 : u32 = gl_LocalInvocationID.x;
  if ((x_755 == 0u)) {
    let x_763 : u32 = work_item;
    x_762.block_has_vertices[x_763] = 0u;
    i_4 = 0;
    loop {
      let x_771 : i32 = i_4;
      if ((x_771 < 64)) {
      } else {
        break;
      }
      let x_774 : i32 = i_4;
      let x_776 : u32 = voxel_vertices[x_774];
      if ((x_776 > 0u)) {
        let x_780 : u32 = work_item;
        x_762.block_has_vertices[x_780] = 1u;
        break;
      }

      continuing {
        let x_783 : i32 = i_4;
        i_4 = (x_783 + 1);
      }
    }
  }
  return;
}

@stage(compute) @workgroup_size(64, 1, 1)
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

@group(0) @binding(4) var<storage, read_write> x_382 : BlockLocations;

@group(0) @binding(2) var<storage, read_write> x_397 : Decompressed;

var<private> gl_LocalInvocationID : vec3<u32>;

var<workgroup> voxel_vertices : array<u32, 64u>;

@group(0) @binding(5) var<storage, read_write> x_650 : BlockIDs;

@group(1) @binding(1) var<storage, read_write> x_654 : BlockWithVertsIndices;

var<private> gl_WorkGroupID : vec3<u32>;

@group(2) @binding(0) var<uniform> x_660 : BlockIndexOffset;

@group(0) @binding(1) var<uniform> x_725 : TriTable;

@group(1) @binding(0) var<storage, read_write> x_815 : BlockOffsets;

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
      let x_284 : vec3<u32> = block_dims_3;
      block_dims_3 = vec3<u32>(vec2<u32>(4u, 4u).x, vec2<u32>(4u, 4u).y, x_284.z);
    }
  }
  let x_286 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_286.x, x_286.z) == vec2<u32>(5u, 5u)))) {
    param_2 = (block_pos_1 + vec3<u32>(1u, 0u, 1u));
    let x_296 : u32 = compute_block_id_vu3_(&(param_2));
    edge_1 = x_296;
    let x_297 : u32 = edge_1;
    let x_299 : u32 = x_255.block_active[x_297];
    if ((x_299 == 0u)) {
      let x_303 : vec3<u32> = block_dims_3;
      block_dims_3 = vec3<u32>(vec2<u32>(4u, 4u).x, x_303.y, vec2<u32>(4u, 4u).y);
    }
  }
  let x_305 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_305.y, x_305.z) == vec2<u32>(5u, 5u)))) {
    param_3 = (block_pos_1 + vec3<u32>(0u, 1u, 1u));
    let x_315 : u32 = compute_block_id_vu3_(&(param_3));
    edge_2 = x_315;
    let x_316 : u32 = edge_2;
    let x_318 : u32 = x_255.block_active[x_316];
    if ((x_318 == 0u)) {
      let x_322 : vec3<u32> = block_dims_3;
      block_dims_3 = vec3<u32>(x_322.x, vec2<u32>(4u, 4u).x, vec2<u32>(4u, 4u).y);
    }
  }
  let x_325 : u32 = block_dims_3.x;
  if ((x_325 == 5u)) {
    param_4 = (block_pos_1 + vec3<u32>(1u, 0u, 0u));
    let x_333 : u32 = compute_block_id_vu3_(&(param_4));
    face = x_333;
    let x_334 : u32 = face;
    let x_336 : u32 = x_255.block_active[x_334];
    if ((x_336 == 0u)) {
      block_dims_3.x = 4u;
    }
  }
  let x_342 : u32 = block_dims_3.y;
  if ((x_342 == 5u)) {
    param_5 = (block_pos_1 + vec3<u32>(0u, 1u, 0u));
    let x_350 : u32 = compute_block_id_vu3_(&(param_5));
    face_1 = x_350;
    let x_351 : u32 = face_1;
    let x_353 : u32 = x_255.block_active[x_351];
    if ((x_353 == 0u)) {
      block_dims_3.y = 4u;
    }
  }
  let x_359 : u32 = block_dims_3.z;
  if ((x_359 == 5u)) {
    param_6 = (block_pos_1 + vec3<u32>(0u, 0u, 1u));
    let x_367 : u32 = compute_block_id_vu3_(&(param_6));
    face_2 = x_367;
    let x_368 : u32 = face_2;
    let x_370 : u32 = x_255.block_active[x_368];
    if ((x_370 == 0u)) {
      block_dims_3.z = 4u;
    }
  }
  let x_375 : vec3<u32> = block_dims_3;
  return x_375;
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
  let x_384 : u32 = x_382.block_locations[neighbor_id];
  neighbor_location = x_384;
  param_7 = ghost_voxel_pos;
  param_8 = block_dims_2;
  let x_388 : u32 = compute_voxel_id_vu3_vu3_(&(param_7), &(param_8));
  ghost_voxel_id = x_388;
  param_9 = neighbor_voxel_pos;
  param_10 = vec3<u32>(4u, 4u, 4u);
  let x_392 : u32 = compute_voxel_id_vu3_vu3_(&(param_9), &(param_10));
  neighbor_voxel_id = x_392;
  let x_393 : u32 = ghost_voxel_id;
  let x_398 : u32 = neighbor_location;
  let x_401 : u32 = neighbor_voxel_id;
  let x_405 : f32 = x_397.decompressed[((x_398 * 64u) + x_401)];
  volume_block[x_393] = x_405;
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
  let x_411 : u32 = gl_LocalInvocationID.x;
  volume_block[(x_411 * 2u)] = 0.0;
  let x_416 : u32 = gl_LocalInvocationID.x;
  volume_block[((x_416 * 2u) + 1u)] = 0.0;
  let x_424 : u32 = gl_LocalInvocationID.x;
  voxel_vertices[x_424] = 0u;
  workgroupBarrier();
  param_11 = block_id;
  let x_430 : vec3<u32> = block_id_to_pos_u1_(&(param_11));
  block_pos_2 = x_430;
  let x_433 : vec4<u32> = x_54.padded_dims;
  n_blocks_3 = (vec3<u32>(x_433.x, x_433.y, x_433.z) / vec3<u32>(4u, 4u, 4u));
  let x_437 : vec3<u32> = block_pos_2;
  let x_438 : vec3<u32> = compute_block_dims_with_ghost_vu3_(x_437);
  block_dims_4 = x_438;
  let x_442 : u32 = gl_LocalInvocationID.x;
  param_12 = x_442;
  let x_443 : vec3<u32> = voxel_id_to_voxel_u1_(&(param_12));
  voxel_pos_2 = x_443;
  let x_444 : vec3<u32> = voxel_pos_2;
  let x_445 : vec3<u32> = voxel_pos_2;
  let x_446 : vec3<u32> = block_dims_4;
  load_voxel_u1_vu3_vu3_vu3_(block_id, x_444, x_445, x_446);
  i_1 = 0u;
  loop {
    var x_466 : bool;
    var x_467_phi : bool;
    let x_454 : u32 = i_1;
    if ((x_454 < 3u)) {
    } else {
      break;
    }
    let x_457 : u32 = i_1;
    let x_459 : u32 = block_dims_4[x_457];
    let x_460 : bool = (x_459 == 5u);
    x_467_phi = x_460;
    if (x_460) {
      let x_463 : u32 = i_1;
      let x_465 : u32 = voxel_pos_2[x_463];
      x_466 = (x_465 == 3u);
      x_467_phi = x_466;
    }
    let x_467 : bool = x_467_phi;
    if (x_467) {
      let x_471 : vec3<u32> = voxel_pos_2;
      let x_474 : u32 = i_1;
      indexable_1 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_478 : vec3<u32> = indexable_1[x_474];
      ghost_voxel_pos_1 = (x_471 + x_478);
      let x_481 : vec3<u32> = ghost_voxel_pos_1;
      neighbor_voxel_pos_1 = x_481;
      let x_482 : u32 = i_1;
      indexable_2 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_485 : u32 = indexable_2[x_482].x;
      if ((x_485 == 1u)) {
        neighbor_voxel_pos_1.x = 0u;
      } else {
        let x_491 : u32 = i_1;
        indexable_3 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
        let x_494 : u32 = indexable_3[x_491].y;
        if ((x_494 == 1u)) {
          neighbor_voxel_pos_1.y = 0u;
        } else {
          neighbor_voxel_pos_1.z = 0u;
        }
      }
      let x_502 : vec3<u32> = block_pos_2;
      let x_503 : u32 = i_1;
      indexable_4 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_506 : vec3<u32> = indexable_4[x_503];
      neighbor_block_pos = (x_502 + x_506);
      let x_510 : vec3<u32> = neighbor_block_pos;
      param_13 = x_510;
      let x_511 : u32 = compute_block_id_vu3_(&(param_13));
      neighbor_id_1 = x_511;
      let x_512 : u32 = neighbor_id_1;
      let x_513 : vec3<u32> = ghost_voxel_pos_1;
      let x_514 : vec3<u32> = neighbor_voxel_pos_1;
      let x_515 : vec3<u32> = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_512, x_513, x_514, x_515);
    }

    continuing {
      let x_517 : u32 = i_1;
      i_1 = (x_517 + bitcast<u32>(1));
    }
  }
  i_2 = 0u;
  loop {
    var x_563 : bool;
    var x_564_phi : bool;
    let x_525 : u32 = i_2;
    if ((x_525 < 3u)) {
    } else {
      break;
    }
    let x_528 : vec3<u32> = block_dims_4;
    let x_530 : u32 = i_2;
    indexable_5 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
    let x_533 : vec3<u32> = indexable_5[x_530];
    b = (x_528 * x_533);
    let x_536 : vec3<u32> = voxel_pos_2;
    let x_537 : u32 = i_2;
    indexable_6 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
    let x_540 : vec3<u32> = indexable_6[x_537];
    p = (x_536 * x_540);
    let x_543 : u32 = b.x;
    let x_545 : u32 = b.y;
    let x_548 : u32 = b.z;
    let x_551 : bool = (((x_543 + x_545) + x_548) == 10u);
    x_564_phi = x_551;
    if (x_551) {
      let x_555 : u32 = p.x;
      let x_557 : u32 = p.y;
      let x_560 : u32 = p.z;
      x_563 = (((x_555 + x_557) + x_560) == 6u);
      x_564_phi = x_563;
    }
    let x_564 : bool = x_564_phi;
    if (x_564) {
      let x_568 : vec3<u32> = voxel_pos_2;
      let x_569 : u32 = i_2;
      indexable_7 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_572 : vec3<u32> = indexable_7[x_569];
      ghost_voxel_pos_2 = (x_568 + x_572);
      let x_575 : vec3<u32> = ghost_voxel_pos_2;
      neighbor_voxel_pos_2 = x_575;
      let x_576 : u32 = i_2;
      indexable_8 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_579 : u32 = indexable_8[x_576].x;
      if ((x_579 == 1u)) {
        neighbor_voxel_pos_2.x = 0u;
      }
      let x_584 : u32 = i_2;
      indexable_9 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_587 : u32 = indexable_9[x_584].y;
      if ((x_587 == 1u)) {
        neighbor_voxel_pos_2.y = 0u;
      }
      let x_592 : u32 = i_2;
      indexable_10 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_595 : u32 = indexable_10[x_592].z;
      if ((x_595 == 1u)) {
        neighbor_voxel_pos_2.z = 0u;
      }
      let x_601 : vec3<u32> = block_pos_2;
      let x_602 : u32 = i_2;
      indexable_11 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_605 : vec3<u32> = indexable_11[x_602];
      neighbor_block_pos_1 = (x_601 + x_605);
      let x_609 : vec3<u32> = neighbor_block_pos_1;
      param_14 = x_609;
      let x_610 : u32 = compute_block_id_vu3_(&(param_14));
      neighbor_id_2 = x_610;
      let x_611 : u32 = neighbor_id_2;
      let x_612 : vec3<u32> = ghost_voxel_pos_2;
      let x_613 : vec3<u32> = neighbor_voxel_pos_2;
      let x_614 : vec3<u32> = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_611, x_612, x_613, x_614);
    }

    continuing {
      let x_616 : u32 = i_2;
      i_2 = (x_616 + bitcast<u32>(1));
    }
  }
  let x_618 : vec3<u32> = block_dims_4;
  let x_621 : vec3<u32> = voxel_pos_2;
  if ((all((x_618 == vec3<u32>(5u, 5u, 5u))) & all((x_621 == vec3<u32>(3u, 3u, 3u))))) {
    let x_629 : vec3<u32> = voxel_pos_2;
    ghost_voxel_pos_3 = (x_629 + vec3<u32>(1u, 1u, 1u));
    let x_632 : vec3<u32> = block_pos_2;
    neighbor_block_pos_2 = (x_632 + vec3<u32>(1u, 1u, 1u));
    let x_636 : vec3<u32> = neighbor_block_pos_2;
    param_15 = x_636;
    let x_637 : u32 = compute_block_id_vu3_(&(param_15));
    neighbor_id_3 = x_637;
    let x_638 : u32 = neighbor_id_3;
    let x_639 : vec3<u32> = ghost_voxel_pos_3;
    let x_641 : vec3<u32> = block_dims_4;
    load_voxel_u1_vu3_vu3_vu3_(x_638, x_639, vec3<u32>(0u, 0u, 0u), x_641);
  }
  workgroupBarrier();
  let x_643 : vec3<u32> = block_dims_4;
  return x_643;
}

fn compute_vertex_values_vu3_vu3_(voxel_pos_1 : ptr<function, vec3<u32>>, block_dims_1 : ptr<function, vec3<u32>>) -> array<f32, 8u> {
  var i : i32;
  var v : vec3<u32>;
  var indexable : array<vec3<i32>, 8u>;
  var voxel : u32;
  var values : array<f32, 8u>;
  i = 0;
  loop {
    let x_144 : i32 = i;
    if ((x_144 < 8)) {
    } else {
      break;
    }
    let x_160 : i32 = i;
    indexable = array<vec3<i32>, 8u>(vec3<i32>(0, 0, 0), vec3<i32>(1, 0, 0), vec3<i32>(1, 1, 0), vec3<i32>(0, 1, 0), vec3<i32>(0, 0, 1), vec3<i32>(1, 0, 1), vec3<i32>(1, 1, 1), vec3<i32>(0, 1, 1));
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
      i = (x_204 + 1);
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
  let x_657 : u32 = gl_WorkGroupID.x;
  let x_662 : u32 = x_660.block_index_offset;
  let x_665 : u32 = x_654.block_with_verts_indices[(x_657 + x_662)];
  let x_667 : u32 = x_650.block_ids[x_665];
  block_id_1 = x_667;
  let x_669 : u32 = block_id_1;
  let x_670 : vec3<u32> = load_block_u1_(x_669);
  block_dims_5 = x_670;
  let x_674 : u32 = gl_LocalInvocationID.x;
  param_16 = x_674;
  let x_675 : vec3<u32> = voxel_id_to_voxel_u1_(&(param_16));
  voxel_pos_3 = x_675;
  nverts = 0u;
  let x_677 : vec3<u32> = voxel_pos_3;
  let x_679 : vec3<u32> = block_dims_5;
  if (all(((x_677 + vec3<u32>(1u, 1u, 1u)) < x_679))) {
    let x_686 : vec3<u32> = voxel_pos_3;
    param_17 = x_686;
    let x_688 : vec3<u32> = block_dims_5;
    param_18 = x_688;
    let x_689 : array<f32, 8u> = compute_vertex_values_vu3_vu3_(&(param_17), &(param_18));
    values_1 = x_689;
    case_index = 0u;
    i_3 = 0;
    loop {
      let x_697 : i32 = i_3;
      if ((x_697 < 8)) {
      } else {
        break;
      }
      let x_699 : i32 = i_3;
      let x_701 : f32 = values_1[x_699];
      let x_704 : f32 = x_54.isovalue;
      if ((x_701 <= x_704)) {
        let x_708 : i32 = i_3;
        let x_711 : u32 = case_index;
        case_index = (x_711 | bitcast<u32>((1 << bitcast<u32>(x_708))));
      }

      continuing {
        let x_713 : i32 = i_3;
        i_3 = (x_713 + 1);
      }
    }
    let x_716 : u32 = case_index;
    chunk = (x_716 * 4u);
    let x_726 : u32 = chunk;
    let x_729 : vec4<i32> = x_725.tri_table[x_726];
    table_chunk = x_729;
    t = 0u;
    loop {
      let x_736 : u32 = t;
      let x_738 : i32 = table_chunk[x_736];
      if ((x_738 != -1)) {
      } else {
        break;
      }
      let x_741 : u32 = nverts;
      nverts = (x_741 + bitcast<u32>(1));
      let x_743 : u32 = t;
      if ((x_743 == 3u)) {
        let x_747 : u32 = chunk;
        let x_748 : u32 = (x_747 + bitcast<u32>(1));
        chunk = x_748;
        let x_750 : vec4<i32> = x_725.tri_table[x_748];
        table_chunk = x_750;
        t = 0u;
      } else {
        let x_752 : u32 = t;
        t = (x_752 + bitcast<u32>(1));
      }
    }
  }
  let x_755 : u32 = gl_LocalInvocationID.x;
  let x_756 : u32 = nverts;
  voxel_vertices[x_755] = x_756;
  offs = 1u;
  d = 32;
  loop {
    let x_766 : i32 = d;
    if ((x_766 > 0)) {
    } else {
      break;
    }
    workgroupBarrier();
    let x_769 : u32 = gl_LocalInvocationID.x;
    let x_770 : i32 = d;
    if ((x_769 < bitcast<u32>(x_770))) {
      let x_776 : u32 = offs;
      let x_778 : u32 = gl_LocalInvocationID.x;
      a = ((x_776 * ((2u * x_778) + 1u)) - 1u);
      let x_784 : u32 = offs;
      let x_786 : u32 = gl_LocalInvocationID.x;
      b_1 = ((x_784 * ((2u * x_786) + 2u)) - 1u);
      let x_791 : u32 = b_1;
      let x_792 : u32 = a;
      let x_794 : u32 = voxel_vertices[x_792];
      let x_796 : u32 = voxel_vertices[x_791];
      voxel_vertices[x_791] = (x_796 + x_794);
    }
    let x_799 : u32 = offs;
    offs = (x_799 << bitcast<u32>(1));

    continuing {
      let x_801 : i32 = d;
      d = (x_801 >> bitcast<u32>(1));
    }
  }
  let x_804 : u32 = gl_LocalInvocationID.x;
  if ((x_804 == 0u)) {
    let x_811 : u32 = voxel_vertices[63];
    block_verts = x_811;
    let x_817 : u32 = gl_WorkGroupID.x;
    let x_819 : u32 = x_660.block_index_offset;
    let x_821 : u32 = block_verts;
    x_815.block_offsets[(x_817 + x_819)] = x_821;
  }
  return;
}

@stage(compute) @workgroup_size(64, 1, 1)
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

@group(0) @binding(4) var<storage, read_write> x_395 : BlockLocations;

@group(0) @binding(2) var<storage, read_write> x_410 : Decompressed;

var<private> gl_LocalInvocationID : vec3<u32>;

var<workgroup> voxel_vertices : array<u32, 64u>;

@group(1) @binding(0) var<storage, read_write> x_744 : BlockInformation;

var<private> gl_WorkGroupID : vec3<u32>;

@group(0) @binding(5) var<storage, read_write> x_759 : BlockIDs;

@group(0) @binding(1) var<uniform> x_820 : TriTable;

@group(2) @binding(0) var<storage, read_write> x_1081 : Vertices;

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
      let x_297 : vec3<u32> = block_dims_3;
      block_dims_3 = vec3<u32>(vec2<u32>(4u, 4u).x, vec2<u32>(4u, 4u).y, x_297.z);
    }
  }
  let x_299 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_299.x, x_299.z) == vec2<u32>(5u, 5u)))) {
    param_2 = (block_pos_1 + vec3<u32>(1u, 0u, 1u));
    let x_309 : u32 = compute_block_id_vu3_(&(param_2));
    edge_1 = x_309;
    let x_310 : u32 = edge_1;
    let x_312 : u32 = x_268.block_active[x_310];
    if ((x_312 == 0u)) {
      let x_316 : vec3<u32> = block_dims_3;
      block_dims_3 = vec3<u32>(vec2<u32>(4u, 4u).x, x_316.y, vec2<u32>(4u, 4u).y);
    }
  }
  let x_318 : vec3<u32> = block_dims_3;
  if (all((vec2<u32>(x_318.y, x_318.z) == vec2<u32>(5u, 5u)))) {
    param_3 = (block_pos_1 + vec3<u32>(0u, 1u, 1u));
    let x_328 : u32 = compute_block_id_vu3_(&(param_3));
    edge_2 = x_328;
    let x_329 : u32 = edge_2;
    let x_331 : u32 = x_268.block_active[x_329];
    if ((x_331 == 0u)) {
      let x_335 : vec3<u32> = block_dims_3;
      block_dims_3 = vec3<u32>(x_335.x, vec2<u32>(4u, 4u).x, vec2<u32>(4u, 4u).y);
    }
  }
  let x_338 : u32 = block_dims_3.x;
  if ((x_338 == 5u)) {
    param_4 = (block_pos_1 + vec3<u32>(1u, 0u, 0u));
    let x_346 : u32 = compute_block_id_vu3_(&(param_4));
    face = x_346;
    let x_347 : u32 = face;
    let x_349 : u32 = x_268.block_active[x_347];
    if ((x_349 == 0u)) {
      block_dims_3.x = 4u;
    }
  }
  let x_355 : u32 = block_dims_3.y;
  if ((x_355 == 5u)) {
    param_5 = (block_pos_1 + vec3<u32>(0u, 1u, 0u));
    let x_363 : u32 = compute_block_id_vu3_(&(param_5));
    face_1 = x_363;
    let x_364 : u32 = face_1;
    let x_366 : u32 = x_268.block_active[x_364];
    if ((x_366 == 0u)) {
      block_dims_3.y = 4u;
    }
  }
  let x_372 : u32 = block_dims_3.z;
  if ((x_372 == 5u)) {
    param_6 = (block_pos_1 + vec3<u32>(0u, 0u, 1u));
    let x_380 : u32 = compute_block_id_vu3_(&(param_6));
    face_2 = x_380;
    let x_381 : u32 = face_2;
    let x_383 : u32 = x_268.block_active[x_381];
    if ((x_383 == 0u)) {
      block_dims_3.z = 4u;
    }
  }
  let x_388 : vec3<u32> = block_dims_3;
  return x_388;
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
  let x_397 : u32 = x_395.block_locations[neighbor_id];
  neighbor_location = x_397;
  param_7 = ghost_voxel_pos;
  param_8 = block_dims_2;
  let x_401 : u32 = compute_voxel_id_vu3_vu3_(&(param_7), &(param_8));
  ghost_voxel_id = x_401;
  param_9 = neighbor_voxel_pos;
  param_10 = vec3<u32>(4u, 4u, 4u);
  let x_405 : u32 = compute_voxel_id_vu3_vu3_(&(param_9), &(param_10));
  neighbor_voxel_id = x_405;
  let x_406 : u32 = ghost_voxel_id;
  let x_411 : u32 = neighbor_location;
  let x_414 : u32 = neighbor_voxel_id;
  let x_418 : f32 = x_410.decompressed[((x_411 * 64u) + x_414)];
  volume_block[x_406] = x_418;
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
  let x_424 : u32 = gl_LocalInvocationID.x;
  volume_block[(x_424 * 2u)] = 0.0;
  let x_429 : u32 = gl_LocalInvocationID.x;
  volume_block[((x_429 * 2u) + 1u)] = 0.0;
  let x_437 : u32 = gl_LocalInvocationID.x;
  voxel_vertices[x_437] = 0u;
  workgroupBarrier();
  param_11 = block_id;
  let x_443 : vec3<u32> = block_id_to_pos_u1_(&(param_11));
  block_pos_2 = x_443;
  let x_446 : vec4<u32> = x_69.padded_dims;
  n_blocks_3 = (vec3<u32>(x_446.x, x_446.y, x_446.z) / vec3<u32>(4u, 4u, 4u));
  let x_450 : vec3<u32> = block_pos_2;
  let x_451 : vec3<u32> = compute_block_dims_with_ghost_vu3_(x_450);
  block_dims_4 = x_451;
  let x_455 : u32 = gl_LocalInvocationID.x;
  param_12 = x_455;
  let x_456 : vec3<u32> = voxel_id_to_voxel_u1_(&(param_12));
  voxel_pos_2 = x_456;
  let x_457 : vec3<u32> = voxel_pos_2;
  let x_458 : vec3<u32> = voxel_pos_2;
  let x_459 : vec3<u32> = block_dims_4;
  load_voxel_u1_vu3_vu3_vu3_(block_id, x_457, x_458, x_459);
  i_1 = 0u;
  loop {
    var x_479 : bool;
    var x_480_phi : bool;
    let x_467 : u32 = i_1;
    if ((x_467 < 3u)) {
    } else {
      break;
    }
    let x_470 : u32 = i_1;
    let x_472 : u32 = block_dims_4[x_470];
    let x_473 : bool = (x_472 == 5u);
    x_480_phi = x_473;
    if (x_473) {
      let x_476 : u32 = i_1;
      let x_478 : u32 = voxel_pos_2[x_476];
      x_479 = (x_478 == 3u);
      x_480_phi = x_479;
    }
    let x_480 : bool = x_480_phi;
    if (x_480) {
      let x_484 : vec3<u32> = voxel_pos_2;
      let x_487 : u32 = i_1;
      indexable_1 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_491 : vec3<u32> = indexable_1[x_487];
      ghost_voxel_pos_1 = (x_484 + x_491);
      let x_494 : vec3<u32> = ghost_voxel_pos_1;
      neighbor_voxel_pos_1 = x_494;
      let x_495 : u32 = i_1;
      indexable_2 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_498 : u32 = indexable_2[x_495].x;
      if ((x_498 == 1u)) {
        neighbor_voxel_pos_1.x = 0u;
      } else {
        let x_504 : u32 = i_1;
        indexable_3 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
        let x_507 : u32 = indexable_3[x_504].y;
        if ((x_507 == 1u)) {
          neighbor_voxel_pos_1.y = 0u;
        } else {
          neighbor_voxel_pos_1.z = 0u;
        }
      }
      let x_515 : vec3<u32> = block_pos_2;
      let x_516 : u32 = i_1;
      indexable_4 = array<vec3<u32>, 3u>(vec3<u32>(1u, 0u, 0u), vec3<u32>(0u, 1u, 0u), vec3<u32>(0u, 0u, 1u));
      let x_519 : vec3<u32> = indexable_4[x_516];
      neighbor_block_pos = (x_515 + x_519);
      let x_523 : vec3<u32> = neighbor_block_pos;
      param_13 = x_523;
      let x_524 : u32 = compute_block_id_vu3_(&(param_13));
      neighbor_id_1 = x_524;
      let x_525 : u32 = neighbor_id_1;
      let x_526 : vec3<u32> = ghost_voxel_pos_1;
      let x_527 : vec3<u32> = neighbor_voxel_pos_1;
      let x_528 : vec3<u32> = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_525, x_526, x_527, x_528);
    }

    continuing {
      let x_530 : u32 = i_1;
      i_1 = (x_530 + bitcast<u32>(1));
    }
  }
  i_2 = 0u;
  loop {
    var x_576 : bool;
    var x_577_phi : bool;
    let x_538 : u32 = i_2;
    if ((x_538 < 3u)) {
    } else {
      break;
    }
    let x_541 : vec3<u32> = block_dims_4;
    let x_543 : u32 = i_2;
    indexable_5 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
    let x_546 : vec3<u32> = indexable_5[x_543];
    b = (x_541 * x_546);
    let x_549 : vec3<u32> = voxel_pos_2;
    let x_550 : u32 = i_2;
    indexable_6 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
    let x_553 : vec3<u32> = indexable_6[x_550];
    p_1 = (x_549 * x_553);
    let x_556 : u32 = b.x;
    let x_558 : u32 = b.y;
    let x_561 : u32 = b.z;
    let x_564 : bool = (((x_556 + x_558) + x_561) == 10u);
    x_577_phi = x_564;
    if (x_564) {
      let x_568 : u32 = p_1.x;
      let x_570 : u32 = p_1.y;
      let x_573 : u32 = p_1.z;
      x_576 = (((x_568 + x_570) + x_573) == 6u);
      x_577_phi = x_576;
    }
    let x_577 : bool = x_577_phi;
    if (x_577) {
      let x_581 : vec3<u32> = voxel_pos_2;
      let x_582 : u32 = i_2;
      indexable_7 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_585 : vec3<u32> = indexable_7[x_582];
      ghost_voxel_pos_2 = (x_581 + x_585);
      let x_588 : vec3<u32> = ghost_voxel_pos_2;
      neighbor_voxel_pos_2 = x_588;
      let x_589 : u32 = i_2;
      indexable_8 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_592 : u32 = indexable_8[x_589].x;
      if ((x_592 == 1u)) {
        neighbor_voxel_pos_2.x = 0u;
      }
      let x_597 : u32 = i_2;
      indexable_9 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_600 : u32 = indexable_9[x_597].y;
      if ((x_600 == 1u)) {
        neighbor_voxel_pos_2.y = 0u;
      }
      let x_605 : u32 = i_2;
      indexable_10 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_608 : u32 = indexable_10[x_605].z;
      if ((x_608 == 1u)) {
        neighbor_voxel_pos_2.z = 0u;
      }
      let x_614 : vec3<u32> = block_pos_2;
      let x_615 : u32 = i_2;
      indexable_11 = array<vec3<u32>, 3u>(vec3<u32>(1u, 1u, 0u), vec3<u32>(1u, 0u, 1u), vec3<u32>(0u, 1u, 1u));
      let x_618 : vec3<u32> = indexable_11[x_615];
      neighbor_block_pos_1 = (x_614 + x_618);
      let x_622 : vec3<u32> = neighbor_block_pos_1;
      param_14 = x_622;
      let x_623 : u32 = compute_block_id_vu3_(&(param_14));
      neighbor_id_2 = x_623;
      let x_624 : u32 = neighbor_id_2;
      let x_625 : vec3<u32> = ghost_voxel_pos_2;
      let x_626 : vec3<u32> = neighbor_voxel_pos_2;
      let x_627 : vec3<u32> = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_624, x_625, x_626, x_627);
    }

    continuing {
      let x_629 : u32 = i_2;
      i_2 = (x_629 + bitcast<u32>(1));
    }
  }
  let x_631 : vec3<u32> = block_dims_4;
  let x_634 : vec3<u32> = voxel_pos_2;
  if ((all((x_631 == vec3<u32>(5u, 5u, 5u))) & all((x_634 == vec3<u32>(3u, 3u, 3u))))) {
    let x_642 : vec3<u32> = voxel_pos_2;
    ghost_voxel_pos_3 = (x_642 + vec3<u32>(1u, 1u, 1u));
    let x_645 : vec3<u32> = block_pos_2;
    neighbor_block_pos_2 = (x_645 + vec3<u32>(1u, 1u, 1u));
    let x_649 : vec3<u32> = neighbor_block_pos_2;
    param_15 = x_649;
    let x_650 : u32 = compute_block_id_vu3_(&(param_15));
    neighbor_id_3 = x_650;
    let x_651 : u32 = neighbor_id_3;
    let x_652 : vec3<u32> = ghost_voxel_pos_3;
    let x_654 : vec3<u32> = block_dims_4;
    load_voxel_u1_vu3_vu3_vu3_(x_651, x_652, vec3<u32>(0u, 0u, 0u), x_654);
  }
  workgroupBarrier();
  let x_656 : vec3<u32> = block_dims_4;
  return x_656;
}

fn compute_vertex_values_vu3_vu3_(voxel_pos_1 : ptr<function, vec3<u32>>, block_dims_1 : ptr<function, vec3<u32>>) -> array<f32, 8u> {
  var i : i32;
  var v : vec3<u32>;
  var indexable : array<vec3<i32>, 8u>;
  var voxel : u32;
  var values : array<f32, 8u>;
  i = 0;
  loop {
    let x_158 : i32 = i;
    if ((x_158 < 8)) {
    } else {
      break;
    }
    let x_173 : i32 = i;
    indexable = array<vec3<i32>, 8u>(vec3<i32>(0, 0, 0), vec3<i32>(1, 0, 0), vec3<i32>(1, 1, 0), vec3<i32>(0, 1, 0), vec3<i32>(0, 0, 1), vec3<i32>(1, 0, 1), vec3<i32>(1, 1, 1), vec3<i32>(0, 1, 1));
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
      i = (x_217 + 1);
    }
  }
  let x_219 : array<f32, 8u> = values;
  return x_219;
}

fn lerp_verts_vi3_vi3_f1_f1_(va : vec3<i32>, vb : vec3<i32>, fa : f32, fb : f32) -> vec3<f32> {
  var t : f32;
  t = 0.0;
  if ((abs((fa - fb)) < 0.001)) {
    t = 0.0;
  } else {
    let x_703 : f32 = x_69.isovalue;
    t = ((x_703 - fa) / (fb - fa));
  }
  let x_709 : f32 = t;
  let x_718 : f32 = t;
  let x_727 : f32 = t;
  return vec3<f32>((f32(va.x) + (x_709 * f32((vb.x - va.x)))), (f32(va.y) + (x_718 * f32((vb.y - va.y)))), (f32(va.z) + (x_727 * f32((vb.z - va.z)))));
}

fn compress_position_vf3_(p : ptr<function, vec3<f32>>) -> u32 {
  var quantized : vec3<u32>;
  var compressed : u32;
  let x_660 : vec3<f32> = *(p);
  quantized = vec3<u32>((((x_660 - vec3<f32>(0.5, 0.5, 0.5)) * 0.25) * 1023.0));
  compressed = 0u;
  let x_671 : u32 = quantized.x;
  let x_676 : u32 = compressed;
  compressed = (x_676 | ((x_671 & 1023u) << bitcast<u32>(20)));
  let x_679 : u32 = quantized.y;
  let x_683 : u32 = compressed;
  compressed = (x_683 | ((x_679 & 1023u) << bitcast<u32>(10)));
  let x_686 : u32 = quantized.z;
  let x_688 : u32 = compressed;
  compressed = (x_688 | (x_686 & 1023u));
  let x_690 : u32 = compressed;
  return x_690;
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
  let x_747 : u32 = gl_WorkGroupID.x;
  let x_750 : BlockInfo_1 = x_744.blocks_with_verts[x_747];
  block_info.index = x_750.index;
  block_info.offset = x_750.offset;
  let x_761 : u32 = block_info.index;
  let x_763 : u32 = x_759.block_ids[x_761];
  block_id_1 = x_763;
  let x_765 : u32 = block_id_1;
  let x_766 : vec3<u32> = load_block_u1_(x_765);
  block_dims_5 = x_766;
  let x_770 : u32 = gl_LocalInvocationID.x;
  param_16 = x_770;
  let x_771 : vec3<u32> = voxel_id_to_voxel_u1_(&(param_16));
  voxel_pos_3 = x_771;
  nverts = 0u;
  let x_773 : vec3<u32> = voxel_pos_3;
  let x_775 : vec3<u32> = block_dims_5;
  if (all(((x_773 + vec3<u32>(1u, 1u, 1u)) < x_775))) {
    let x_782 : vec3<u32> = voxel_pos_3;
    param_17 = x_782;
    let x_784 : vec3<u32> = block_dims_5;
    param_18 = x_784;
    let x_785 : array<f32, 8u> = compute_vertex_values_vu3_vu3_(&(param_17), &(param_18));
    values_1 = x_785;
    case_index = 0u;
    i_3 = 0;
    loop {
      let x_793 : i32 = i_3;
      if ((x_793 < 8)) {
      } else {
        break;
      }
      let x_795 : i32 = i_3;
      let x_797 : f32 = values_1[x_795];
      let x_799 : f32 = x_69.isovalue;
      if ((x_797 <= x_799)) {
        let x_803 : i32 = i_3;
        let x_806 : u32 = case_index;
        case_index = (x_806 | bitcast<u32>((1 << bitcast<u32>(x_803))));
      }

      continuing {
        let x_808 : i32 = i_3;
        i_3 = (x_808 + 1);
      }
    }
    let x_811 : u32 = case_index;
    chunk = (x_811 * 4u);
    let x_821 : u32 = chunk;
    let x_824 : vec4<i32> = x_820.tri_table[x_821];
    table_chunk = x_824;
    t_1 = 0u;
    loop {
      let x_831 : u32 = t_1;
      let x_833 : i32 = table_chunk[x_831];
      if ((x_833 != -1)) {
      } else {
        break;
      }
      let x_836 : u32 = nverts;
      nverts = (x_836 + bitcast<u32>(1));
      let x_838 : u32 = t_1;
      if ((x_838 == 3u)) {
        let x_842 : u32 = chunk;
        let x_843 : u32 = (x_842 + bitcast<u32>(1));
        chunk = x_843;
        let x_845 : vec4<i32> = x_820.tri_table[x_843];
        table_chunk = x_845;
        t_1 = 0u;
      } else {
        let x_847 : u32 = t_1;
        t_1 = (x_847 + bitcast<u32>(1));
      }
    }
  }
  let x_850 : u32 = gl_LocalInvocationID.x;
  let x_851 : u32 = nverts;
  voxel_vertices[x_850] = x_851;
  offs = 1u;
  d = 32;
  loop {
    let x_861 : i32 = d;
    if ((x_861 > 0)) {
    } else {
      break;
    }
    workgroupBarrier();
    let x_864 : u32 = gl_LocalInvocationID.x;
    let x_865 : i32 = d;
    if ((x_864 < bitcast<u32>(x_865))) {
      let x_871 : u32 = offs;
      let x_873 : u32 = gl_LocalInvocationID.x;
      a = ((x_871 * ((2u * x_873) + 1u)) - 1u);
      let x_879 : u32 = offs;
      let x_881 : u32 = gl_LocalInvocationID.x;
      b_1 = ((x_879 * ((2u * x_881) + 2u)) - 1u);
      let x_886 : u32 = b_1;
      let x_887 : u32 = a;
      let x_889 : u32 = voxel_vertices[x_887];
      let x_891 : u32 = voxel_vertices[x_886];
      voxel_vertices[x_886] = (x_891 + x_889);
    }
    let x_894 : u32 = offs;
    offs = (x_894 << bitcast<u32>(1));

    continuing {
      let x_896 : i32 = d;
      d = (x_896 >> bitcast<u32>(1));
    }
  }
  let x_899 : u32 = gl_LocalInvocationID.x;
  if ((x_899 == 0u)) {
    voxel_vertices[63] = 0u;
  }
  d_1 = 1;
  loop {
    let x_911 : i32 = d_1;
    if ((x_911 < 64)) {
    } else {
      break;
    }
    let x_914 : u32 = offs;
    offs = (x_914 >> bitcast<u32>(1));
    workgroupBarrier();
    let x_917 : u32 = gl_LocalInvocationID.x;
    let x_918 : i32 = d_1;
    if ((x_917 < bitcast<u32>(x_918))) {
      let x_924 : u32 = offs;
      let x_926 : u32 = gl_LocalInvocationID.x;
      a_1 = ((x_924 * ((2u * x_926) + 1u)) - 1u);
      let x_932 : u32 = offs;
      let x_934 : u32 = gl_LocalInvocationID.x;
      b_2 = ((x_932 * ((2u * x_934) + 2u)) - 1u);
      let x_940 : u32 = a_1;
      let x_942 : u32 = voxel_vertices[x_940];
      tmp = x_942;
      let x_943 : u32 = a_1;
      let x_944 : u32 = b_2;
      let x_946 : u32 = voxel_vertices[x_944];
      voxel_vertices[x_943] = x_946;
      let x_948 : u32 = b_2;
      let x_949 : u32 = tmp;
      let x_951 : u32 = voxel_vertices[x_948];
      voxel_vertices[x_948] = (x_951 + x_949);
    }

    continuing {
      let x_954 : i32 = d_1;
      d_1 = (x_954 << bitcast<u32>(1));
    }
  }
  workgroupBarrier();
  let x_958 : u32 = block_info.offset;
  let x_960 : u32 = gl_LocalInvocationID.x;
  let x_962 : u32 = voxel_vertices[x_960];
  vertex_offset = (x_958 + x_962);
  let x_964 : vec3<u32> = voxel_pos_3;
  let x_966 : vec3<u32> = block_dims_5;
  if (all(((x_964 + vec3<u32>(1u, 1u, 1u)) < x_966))) {
    let x_973 : vec3<u32> = voxel_pos_3;
    param_19 = x_973;
    let x_975 : vec3<u32> = block_dims_5;
    param_20 = x_975;
    let x_976 : array<f32, 8u> = compute_vertex_values_vu3_vu3_(&(param_19), &(param_20));
    values_2 = x_976;
    case_index_1 = 0u;
    i_4 = 0;
    loop {
      let x_984 : i32 = i_4;
      if ((x_984 < 8)) {
      } else {
        break;
      }
      let x_986 : i32 = i_4;
      let x_988 : f32 = values_2[x_986];
      let x_990 : f32 = x_69.isovalue;
      if ((x_988 <= x_990)) {
        let x_994 : i32 = i_4;
        let x_997 : u32 = case_index_1;
        case_index_1 = (x_997 | bitcast<u32>((1 << bitcast<u32>(x_994))));
      }

      continuing {
        let x_999 : i32 = i_4;
        i_4 = (x_999 + 1);
      }
    }
    cid = 0u;
    let x_1003 : u32 = case_index_1;
    chunk_1 = (x_1003 * 4u);
    let x_1006 : u32 = chunk_1;
    let x_1008 : vec4<i32> = x_820.tri_table[x_1006];
    table_chunk_1 = x_1008;
    t_2 = 0u;
    loop {
      let x_1015 : u32 = t_2;
      let x_1017 : i32 = table_chunk_1[x_1015];
      if ((x_1017 != -1)) {
      } else {
        break;
      }
      let x_1041 : u32 = t_2;
      let x_1043 : i32 = table_chunk_1[x_1041];
      indexable_12 = array<array<i32, 2u>, 12u>(array<i32, 2u>(0, 1), array<i32, 2u>(1, 2), array<i32, 2u>(2, 3), array<i32, 2u>(3, 0), array<i32, 2u>(4, 5), array<i32, 2u>(6, 5), array<i32, 2u>(6, 7), array<i32, 2u>(7, 4), array<i32, 2u>(0, 4), array<i32, 2u>(1, 5), array<i32, 2u>(2, 6), array<i32, 2u>(3, 7));
      let x_1047 : i32 = indexable_12[x_1043][0];
      v0 = bitcast<u32>(x_1047);
      let x_1050 : u32 = t_2;
      let x_1052 : i32 = table_chunk_1[x_1050];
      indexable_13 = array<array<i32, 2u>, 12u>(array<i32, 2u>(0, 1), array<i32, 2u>(1, 2), array<i32, 2u>(2, 3), array<i32, 2u>(3, 0), array<i32, 2u>(4, 5), array<i32, 2u>(6, 5), array<i32, 2u>(6, 7), array<i32, 2u>(7, 4), array<i32, 2u>(0, 4), array<i32, 2u>(1, 5), array<i32, 2u>(2, 6), array<i32, 2u>(3, 7));
      let x_1055 : i32 = indexable_13[x_1052][1];
      v1 = bitcast<u32>(x_1055);
      let x_1058 : u32 = v0;
      indexable_14 = array<vec3<i32>, 8u>(vec3<i32>(0, 0, 0), vec3<i32>(1, 0, 0), vec3<i32>(1, 1, 0), vec3<i32>(0, 1, 0), vec3<i32>(0, 0, 1), vec3<i32>(1, 0, 1), vec3<i32>(1, 1, 1), vec3<i32>(0, 1, 1));
      let x_1061 : vec3<i32> = indexable_14[x_1058];
      let x_1062 : u32 = v1;
      indexable_15 = array<vec3<i32>, 8u>(vec3<i32>(0, 0, 0), vec3<i32>(1, 0, 0), vec3<i32>(1, 1, 0), vec3<i32>(0, 1, 0), vec3<i32>(0, 0, 1), vec3<i32>(1, 0, 1), vec3<i32>(1, 1, 1), vec3<i32>(0, 1, 1));
      let x_1065 : vec3<i32> = indexable_15[x_1062];
      let x_1066 : u32 = v0;
      let x_1068 : f32 = values_2[x_1066];
      let x_1069 : u32 = v1;
      let x_1071 : f32 = values_2[x_1069];
      let x_1072 : vec3<f32> = lerp_verts_vi3_vi3_f1_f1_(x_1061, x_1065, x_1068, x_1071);
      let x_1073 : vec3<u32> = voxel_pos_3;
      v_1 = ((x_1072 + vec3<f32>(x_1073)) + vec3<f32>(0.5, 0.5, 0.5));
      let x_1082 : u32 = vertex_offset;
      let x_1083 : u32 = chunk_1;
      let x_1087 : u32 = t_2;
      let x_1090 : vec3<f32> = v_1;
      param_21 = x_1090;
      let x_1091 : u32 = compress_position_vf3_(&(param_21));
      let x_1092 : u32 = block_id_1;
      x_1081.verts[((x_1082 + (4u * (x_1083 % 4u))) + x_1087)] = vec2<u32>(x_1091, x_1092);
      let x_1096 : u32 = t_2;
      if ((x_1096 == 3u)) {
        let x_1100 : u32 = chunk_1;
        let x_1101 : u32 = (x_1100 + bitcast<u32>(1));
        chunk_1 = x_1101;
        let x_1103 : vec4<i32> = x_820.tri_table[x_1101];
        table_chunk_1 = x_1103;
        t_2 = 0u;
      } else {
        let x_1105 : u32 = t_2;
        t_2 = (x_1105 + bitcast<u32>(1));
      }

      continuing {
        let x_1107 : u32 = cid;
        cid = (x_1107 + bitcast<u32>(1));
      }
    }
  }
  return;
}

@stage(compute) @workgroup_size(64, 1, 1)
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

@stage(compute) @workgroup_size(1, 1, 1)
fn main(@builtin(workgroup_id) gl_WorkGroupID_param : vec3<u32>) {
  gl_WorkGroupID = gl_WorkGroupID_param;
  main_1();
}
`;

const lru_cache_init_comp_spv = `struct Slot {
  age : u32,
  available : u32,
  item_id : i32,
}

type RTArr = array<Slot>;

struct SlotData {
  slot_data : RTArr,
}

struct OldSize {
  old_size : u32,
}

type RTArr_1 = array<i32>;

struct CachedItemSlots {
  cached_item_slot : RTArr_1,
}

type RTArr_2 = array<u32>;

struct SlotAvailableIDs {
  slot_available_id : RTArr_2,
}

@group(0) @binding(2) var<storage, read_write> x_12 : SlotData;

@group(1) @binding(0) var<uniform> x_16 : OldSize;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(0) @binding(0) var<storage, read_write> x_50 : CachedItemSlots;

@group(0) @binding(1) var<storage, read_write> x_54 : SlotAvailableIDs;

fn main_1() {
  let x_19 : u32 = x_16.old_size;
  let x_26 : u32 = gl_GlobalInvocationID.x;
  x_12.slot_data[(x_19 + x_26)].age = 100000u;
  let x_31 : u32 = x_16.old_size;
  let x_33 : u32 = gl_GlobalInvocationID.x;
  x_12.slot_data[(x_31 + x_33)].available = 1u;
  let x_39 : u32 = x_16.old_size;
  let x_41 : u32 = gl_GlobalInvocationID.x;
  x_12.slot_data[(x_39 + x_41)].item_id = -1;
  return;
}

@stage(compute) @workgroup_size(32, 1, 1)
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
  if ((x_37 >= 0)) {
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

@stage(compute) @workgroup_size(32, 1, 1)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_cache_update_comp_spv = `struct NumNewItemIDs {
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

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(2) @binding(0) var<uniform> x_16 : NumNewItemIDs;

@group(1) @binding(0) var<storage, read_write> x_32 : NewItemIDs;

@group(0) @binding(1) var<storage, read_write> x_41 : SlotAvailableIDs;

@group(0) @binding(2) var<storage, read_write> x_52 : SlotData;

@group(0) @binding(0) var<storage, read_write> x_66 : CachedItemSlots;

fn main_1() {
  var item : u32;
  var slot : u32;
  var prev : i32;
  let x_13 : u32 = gl_GlobalInvocationID.x;
  let x_21 : u32 = x_16.num_new_items;
  if ((x_13 >= x_21)) {
    return;
  }
  let x_34 : u32 = gl_GlobalInvocationID.x;
  let x_36 : u32 = x_32.new_items[x_34];
  item = x_36;
  let x_43 : u32 = gl_GlobalInvocationID.x;
  let x_45 : u32 = x_41.slot_available_id[x_43];
  slot = x_45;
  let x_53 : u32 = slot;
  let x_57 : i32 = x_52.slot_data[x_53].item_id;
  prev = x_57;
  let x_58 : i32 = prev;
  if ((x_58 != -1)) {
    let x_67 : i32 = prev;
    x_66.cached_item_slot[x_67] = -1;
  }
  let x_69 : u32 = slot;
  x_52.slot_data[x_69].age = 0u;
  let x_71 : u32 = slot;
  let x_72 : u32 = item;
  x_52.slot_data[x_71].item_id = bitcast<i32>(x_72);
  let x_75 : u32 = slot;
  x_52.slot_data[x_75].available = 0u;
  let x_78 : u32 = item;
  let x_79 : u32 = slot;
  x_66.cached_item_slot[x_78] = bitcast<i32>(x_79);
  return;
}

@stage(compute) @workgroup_size(32, 1, 1)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_copy_available_slot_age_comp_spv = `struct NumNewItemIDs {
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

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(2) @binding(0) var<uniform> x_16 : NumNewItemIDs;

@group(1) @binding(0) var<storage, read_write> x_30 : AvailableSlotAges;

@group(0) @binding(2) var<storage, read_write> x_37 : SlotData;

@group(0) @binding(1) var<storage, read_write> x_41 : SlotAvailableIDs;

@group(0) @binding(0) var<storage, read_write> x_52 : CachedItemSlots;

fn main_1() {
  let x_13 : u32 = gl_GlobalInvocationID.x;
  let x_21 : u32 = x_16.num_slots_available;
  if ((x_13 >= x_21)) {
    return;
  }
  let x_32 : u32 = gl_GlobalInvocationID.x;
  let x_43 : u32 = gl_GlobalInvocationID.x;
  let x_45 : u32 = x_41.slot_available_id[x_43];
  let x_47 : u32 = x_37.slot_data[x_45].age;
  x_30.available_slot_ages[x_32] = x_47;
  return;
}

@stage(compute) @workgroup_size(32, 1, 1)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_cache_age_slots_comp_spv = `struct Slot {
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

@group(0) @binding(2) var<storage, read_write> x_12 : SlotData;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(0) @binding(0) var<storage, read_write> x_30 : CachedItemSlots;

@group(0) @binding(1) var<storage, read_write> x_34 : SlotAvailableIDs;

fn main_1() {
  let x_20 : u32 = gl_GlobalInvocationID.x;
  let x_24 : u32 = x_12.slot_data[x_20].age;
  x_12.slot_data[x_20].age = (x_24 + 1u);
  return;
}

@stage(compute) @workgroup_size(32, 1, 1)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_cache_extract_slot_available_comp_spv = `type RTArr = array<u32>;

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

@group(1) @binding(0) var<storage, read_write> x_10 : Output;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(0) @binding(2) var<storage, read_write> x_24 : SlotData;

@group(0) @binding(0) var<storage, read_write> x_35 : CachedItemSlots;

@group(0) @binding(1) var<storage, read_write> x_39 : SlotAvailableIDs;

fn main_1() {
  let x_19 : u32 = gl_GlobalInvocationID.x;
  let x_26 : u32 = gl_GlobalInvocationID.x;
  let x_30 : u32 = x_24.slot_data[x_26].available;
  x_10.out_buf[x_19] = x_30;
  return;
}

@stage(compute) @workgroup_size(32, 1, 1)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const radix_sort_chunk_comp_spv = `struct BufferInfo {
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

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(0) @binding(0) var<uniform> x_16 : BufferInfo;

var<workgroup> key_buf : array<u32, 64u>;

var<private> gl_LocalInvocationID : vec3<u32>;

@group(1) @binding(0) var<storage, read_write> x_36 : Keys;

var<workgroup> val_buf : array<u32, 64u>;

@group(1) @binding(1) var<storage, read_write> x_49 : Values;

var<workgroup> scratch : array<u32, 64u>;

var<workgroup> total_false : u32;

var<workgroup> sorted_key_buf : array<u32, 64u>;

var<workgroup> sorted_val_buf : array<u32, 64u>;

fn main_1() {
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
  let x_13 : u32 = gl_GlobalInvocationID.x;
  let x_21 : u32 = x_16.size;
  if ((x_13 < x_21)) {
    let x_32 : u32 = gl_LocalInvocationID.x;
    let x_38 : u32 = gl_GlobalInvocationID.x;
    let x_40 : u32 = x_36.keys[x_38];
    key_buf[x_32] = x_40;
    let x_45 : u32 = gl_LocalInvocationID.x;
    let x_51 : u32 = gl_GlobalInvocationID.x;
    let x_53 : u32 = x_49.values[x_51];
    val_buf[x_45] = x_53;
  } else {
    let x_57 : u32 = gl_LocalInvocationID.x;
    key_buf[x_57] = 4294967295u;
    let x_61 : u32 = gl_LocalInvocationID.x;
    val_buf[x_61] = 4294967295u;
  }
  i = 0u;
  loop {
    let x_70 : u32 = i;
    if ((x_70 < 32u)) {
    } else {
      break;
    }
    workgroupBarrier();
    let x_77 : u32 = i;
    mask = bitcast<u32>((1 << x_77));
    let x_82 : u32 = gl_LocalInvocationID.x;
    let x_84 : u32 = gl_LocalInvocationID.x;
    let x_86 : u32 = key_buf[x_84];
    let x_87 : u32 = mask;
    scratch[x_82] = bitcast<u32>(select(1, 0, ((x_86 & x_87) != 0u)));
    offs = 1u;
    d = 32;
    loop {
      let x_103 : i32 = d;
      if ((x_103 > 0)) {
      } else {
        break;
      }
      workgroupBarrier();
      let x_106 : u32 = gl_LocalInvocationID.x;
      let x_107 : i32 = d;
      if ((x_106 < bitcast<u32>(x_107))) {
        let x_113 : u32 = offs;
        let x_115 : u32 = gl_LocalInvocationID.x;
        a = ((x_113 * ((2u * x_115) + 1u)) - 1u);
        let x_121 : u32 = offs;
        let x_123 : u32 = gl_LocalInvocationID.x;
        b = ((x_121 * ((2u * x_123) + 2u)) - 1u);
        let x_128 : u32 = b;
        let x_129 : u32 = a;
        let x_131 : u32 = scratch[x_129];
        let x_133 : u32 = scratch[x_128];
        scratch[x_128] = (x_133 + x_131);
      }
      let x_136 : u32 = offs;
      offs = (x_136 << bitcast<u32>(1));

      continuing {
        let x_138 : i32 = d;
        d = (x_138 >> bitcast<u32>(1));
      }
    }
    let x_141 : u32 = gl_LocalInvocationID.x;
    if ((x_141 == 0u)) {
      let x_148 : u32 = scratch[63];
      total_false = x_148;
      scratch[63] = 0u;
    }
    d_1 = 1;
    loop {
      let x_156 : i32 = d_1;
      if ((x_156 < 64)) {
      } else {
        break;
      }
      let x_159 : u32 = offs;
      offs = (x_159 >> bitcast<u32>(1));
      workgroupBarrier();
      let x_162 : u32 = gl_LocalInvocationID.x;
      let x_163 : i32 = d_1;
      if ((x_162 < bitcast<u32>(x_163))) {
        let x_169 : u32 = offs;
        let x_171 : u32 = gl_LocalInvocationID.x;
        a_1 = ((x_169 * ((2u * x_171) + 1u)) - 1u);
        let x_177 : u32 = offs;
        let x_179 : u32 = gl_LocalInvocationID.x;
        b_1 = ((x_177 * ((2u * x_179) + 2u)) - 1u);
        let x_185 : u32 = a_1;
        let x_187 : u32 = scratch[x_185];
        tmp = x_187;
        let x_188 : u32 = a_1;
        let x_189 : u32 = b_1;
        let x_191 : u32 = scratch[x_189];
        scratch[x_188] = x_191;
        let x_193 : u32 = b_1;
        let x_194 : u32 = tmp;
        let x_196 : u32 = scratch[x_193];
        scratch[x_193] = (x_196 + x_194);
      }

      continuing {
        let x_199 : i32 = d_1;
        d_1 = (x_199 << bitcast<u32>(1));
      }
    }
    workgroupBarrier();
    let x_203 : u32 = gl_LocalInvocationID.x;
    let x_205 : u32 = scratch[x_203];
    f = x_205;
    let x_208 : u32 = gl_LocalInvocationID.x;
    let x_209 : u32 = f;
    let x_211 : u32 = total_false;
    t = ((x_208 - x_209) + x_211);
    let x_214 : u32 = gl_LocalInvocationID.x;
    let x_216 : u32 = key_buf[x_214];
    let x_217 : u32 = mask;
    if (((x_216 & x_217) != 0u)) {
      let x_223 : u32 = t;
      let x_225 : u32 = gl_LocalInvocationID.x;
      let x_227 : u32 = key_buf[x_225];
      sorted_key_buf[x_223] = x_227;
      let x_230 : u32 = t;
      let x_232 : u32 = gl_LocalInvocationID.x;
      let x_234 : u32 = val_buf[x_232];
      sorted_val_buf[x_230] = x_234;
    } else {
      let x_237 : u32 = f;
      let x_239 : u32 = gl_LocalInvocationID.x;
      let x_241 : u32 = key_buf[x_239];
      sorted_key_buf[x_237] = x_241;
      let x_243 : u32 = f;
      let x_245 : u32 = gl_LocalInvocationID.x;
      let x_247 : u32 = val_buf[x_245];
      sorted_val_buf[x_243] = x_247;
    }
    workgroupBarrier();
    let x_250 : u32 = gl_LocalInvocationID.x;
    let x_252 : u32 = gl_LocalInvocationID.x;
    let x_254 : u32 = sorted_key_buf[x_252];
    key_buf[x_250] = x_254;
    let x_257 : u32 = gl_LocalInvocationID.x;
    let x_259 : u32 = gl_LocalInvocationID.x;
    let x_261 : u32 = sorted_val_buf[x_259];
    val_buf[x_257] = x_261;

    continuing {
      let x_263 : u32 = i;
      i = (x_263 + bitcast<u32>(1));
    }
  }
  workgroupBarrier();
  let x_266 : u32 = gl_GlobalInvocationID.x;
  let x_268 : u32 = gl_LocalInvocationID.x;
  let x_270 : u32 = key_buf[x_268];
  x_36.keys[x_266] = x_270;
  let x_273 : u32 = gl_GlobalInvocationID.x;
  let x_275 : u32 = gl_LocalInvocationID.x;
  let x_277 : u32 = val_buf[x_275];
  x_49.values[x_273] = x_277;
  return;
}

@stage(compute) @workgroup_size(64, 1, 1)
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

var<private> gl_WorkGroupID : vec3<u32>;

var<private> gl_LocalInvocationID : vec3<u32>;

@group(1) @binding(2) var<storage, read_write> x_231 : OutputKeys;

@group(1) @binding(3) var<storage, read_write> x_240 : OutputValues;

@group(1) @binding(1) var<storage, read_write> x_245 : InputValues;

fn next_pow2_u1_(x : ptr<function, u32>) -> u32 {
  let x_23 : u32 = *(x);
  *(x) = (x_23 - 1u);
  let x_26 : u32 = *(x);
  let x_30 : u32 = *(x);
  *(x) = (x_30 | (x_26 >> bitcast<u32>(1)));
  let x_32 : u32 = *(x);
  let x_35 : u32 = *(x);
  *(x) = (x_35 | (x_32 >> bitcast<u32>(2)));
  let x_37 : u32 = *(x);
  let x_40 : u32 = *(x);
  *(x) = (x_40 | (x_37 >> bitcast<u32>(4)));
  let x_42 : u32 = *(x);
  let x_45 : u32 = *(x);
  *(x) = (x_45 | (x_42 >> bitcast<u32>(8)));
  let x_47 : u32 = *(x);
  let x_50 : u32 = *(x);
  *(x) = (x_50 | (x_47 >> bitcast<u32>(16)));
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
  param = u32(ceil((f32(x_134) / 64.0)));
  let x_142 : u32 = next_pow2_u1_(&(param));
  aligned_size = (x_142 * 64u);
  let x_146 : u32 = aligned_size;
  let x_151 : u32 = x_149.work_groups_x;
  merge_output_size = (x_146 / x_151);
  let x_154 : u32 = merge_output_size;
  merge_chunk_size = (x_154 / 2u);
  let x_162 : u32 = gl_WorkGroupID.x;
  let x_163 : u32 = merge_output_size;
  offs = (x_162 * x_163);
  i_2 = 0u;
  loop {
    let x_171 : u32 = i_2;
    let x_172 : u32 = merge_chunk_size;
    if ((x_171 < (x_172 / 64u))) {
    } else {
      break;
    }
    let x_176 : u32 = offs;
    let x_177 : u32 = i_2;
    let x_182 : u32 = gl_LocalInvocationID.x;
    a_in = ((x_176 + (x_177 * 64u)) + x_182);
    let x_185 : u32 = offs;
    let x_186 : u32 = merge_chunk_size;
    let x_188 : u32 = i_2;
    let x_192 : u32 = gl_LocalInvocationID.x;
    b_in = (((x_185 + x_186) + (x_188 * 64u)) + x_192);
    let x_196 : u32 = gl_LocalInvocationID.x;
    let x_197 : u32 = i_2;
    base_idx = (x_196 + (x_197 * 64u));
    let x_201 : u32 = base_idx;
    let x_202 : u32 = offs;
    let x_203 : u32 = merge_chunk_size;
    let x_205 : u32 = a_in;
    param_1 = (x_202 + x_203);
    let x_208 : u32 = merge_chunk_size;
    param_2 = x_208;
    let x_211 : u32 = x_75.input_keys[x_205];
    param_3 = x_211;
    let x_212 : u32 = upper_bound_u1_u1_u1_(&(param_1), &(param_2), &(param_3));
    let x_214 : u32 = merge_chunk_size;
    a_loc = ((x_201 + x_212) - x_214);
    let x_217 : u32 = base_idx;
    let x_218 : u32 = b_in;
    let x_220 : u32 = offs;
    param_4 = x_220;
    let x_222 : u32 = merge_chunk_size;
    param_5 = x_222;
    let x_225 : u32 = x_75.input_keys[x_218];
    param_6 = x_225;
    let x_226 : u32 = lower_bound_u1_u1_u1_(&(param_4), &(param_5), &(param_6));
    b_loc = (x_217 + x_226);
    let x_232 : u32 = a_loc;
    let x_233 : u32 = a_in;
    let x_235 : u32 = x_75.input_keys[x_233];
    x_231.output_keys[x_232] = x_235;
    let x_241 : u32 = a_loc;
    let x_246 : u32 = a_in;
    let x_248 : u32 = x_245.input_values[x_246];
    x_240.output_values[x_241] = x_248;
    let x_250 : u32 = b_loc;
    let x_251 : u32 = b_in;
    let x_253 : u32 = x_75.input_keys[x_251];
    x_231.output_keys[x_250] = x_253;
    let x_255 : u32 = b_loc;
    let x_256 : u32 = b_in;
    let x_258 : u32 = x_245.input_values[x_256];
    x_240.output_values[x_255] = x_258;

    continuing {
      let x_260 : u32 = i_2;
      i_2 = (x_260 + bitcast<u32>(1));
    }
  }
  return;
}

@stage(compute) @workgroup_size(64, 1, 1)
fn main(@builtin(workgroup_id) gl_WorkGroupID_param : vec3<u32>, @builtin(local_invocation_id) gl_LocalInvocationID_param : vec3<u32>) {
  gl_WorkGroupID = gl_WorkGroupID_param;
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  main_1();
}
`;

const reverse_buffer_comp_spv = `struct BufferInfo {
  size : u32,
}

type RTArr = array<u32>;

struct Values {
  values : RTArr,
}

@group(0) @binding(0) var<uniform> x_48 : BufferInfo;

var<private> gl_GlobalInvocationID : vec3<u32>;

@group(1) @binding(0) var<storage, read_write> x_94 : Values;

fn next_pow2_u1_(x : ptr<function, u32>) -> u32 {
  let x_12 : u32 = *(x);
  *(x) = (x_12 - 1u);
  let x_15 : u32 = *(x);
  let x_19 : u32 = *(x);
  *(x) = (x_19 | (x_15 >> bitcast<u32>(1)));
  let x_21 : u32 = *(x);
  let x_24 : u32 = *(x);
  *(x) = (x_24 | (x_21 >> bitcast<u32>(2)));
  let x_26 : u32 = *(x);
  let x_29 : u32 = *(x);
  *(x) = (x_29 | (x_26 >> bitcast<u32>(4)));
  let x_31 : u32 = *(x);
  let x_34 : u32 = *(x);
  *(x) = (x_34 | (x_31 >> bitcast<u32>(8)));
  let x_36 : u32 = *(x);
  let x_39 : u32 = *(x);
  *(x) = (x_39 | (x_36 >> bitcast<u32>(16)));
  let x_41 : u32 = *(x);
  return (x_41 + 1u);
}

fn main_1() {
  var aligned_size : u32;
  var param : u32;
  var i : u32;
  var j : u32;
  var tmp : u32;
  var x_76 : bool;
  var x_77_phi : bool;
  let x_52 : u32 = x_48.size;
  param = u32(ceil((f32(x_52) / 64.0)));
  let x_60 : u32 = next_pow2_u1_(&(param));
  aligned_size = (x_60 * 64u);
  let x_64 : u32 = aligned_size;
  let x_65 : bool = (x_64 < 64u);
  x_77_phi = x_65;
  if (x_65) {
    let x_74 : u32 = gl_GlobalInvocationID.x;
    x_76 = (x_74 > 32u);
    x_77_phi = x_76;
  }
  let x_77 : bool = x_77_phi;
  if (x_77) {
    return;
  }
  let x_83 : u32 = gl_GlobalInvocationID.x;
  i = x_83;
  let x_85 : u32 = aligned_size;
  let x_87 : u32 = gl_GlobalInvocationID.x;
  j = ((x_85 - x_87) - 1u);
  let x_95 : u32 = i;
  let x_97 : u32 = x_94.values[x_95];
  tmp = x_97;
  let x_98 : u32 = i;
  let x_99 : u32 = j;
  let x_101 : u32 = x_94.values[x_99];
  x_94.values[x_98] = x_101;
  let x_103 : u32 = j;
  let x_104 : u32 = tmp;
  x_94.values[x_103] = x_104;
  return;
}

@stage(compute) @workgroup_size(64, 1, 1)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3<u32>) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

