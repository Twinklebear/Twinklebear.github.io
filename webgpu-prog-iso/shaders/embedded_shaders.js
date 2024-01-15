const ScanBlockSize = 512;
const SortChunkSize = 64;
const prefix_sum_comp_spv = `alias RTArr = array<u32>;

struct Data {
  /* @offset(0) */
  vals : RTArr,
}

alias RTArr_1 = array<u32>;

struct BlockSums {
  /* @offset(0) */
  block_sums : RTArr_1,
}

var<workgroup> chunk : array<u32, 512u>;

var<private> gl_LocalInvocationID : vec3u;

@group(0) @binding(0) var<storage, read_write> x_23 : Data;

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(1) var<storage, read_write> x_105 : BlockSums;

fn main_1(tint_wgid : vec3u) {
  var offs : u32;
  var d : i32;
  var a : u32;
  var b : u32;
  var d_1 : i32;
  var a_1 : u32;
  var b_1 : u32;
  var tmp : u32;
  let x_18 = gl_LocalInvocationID.x;
  chunk[(2u * x_18)] = x_23.vals[(2u * gl_GlobalInvocationID.x)];
  let x_36 = gl_LocalInvocationID.x;
  chunk[((2u * x_36) + 1u)] = x_23.vals[((2u * gl_GlobalInvocationID.x) + 1u)];
  offs = 1u;
  d = 256i;
  loop {
    if ((d > 0i)) {
    } else {
      break;
    }
    workgroupBarrier();
    if ((gl_LocalInvocationID.x < bitcast<u32>(d))) {
      a = ((offs * ((2u * gl_LocalInvocationID.x) + 1u)) - 1u);
      b = ((offs * ((2u * gl_LocalInvocationID.x) + 2u)) - 1u);
      let x_84 = b;
      chunk[x_84] = (chunk[b] + chunk[a]);
    }
    offs = (offs << bitcast<u32>(1i));

    continuing {
      d = (d >> bitcast<u32>(1i));
    }
  }
  if ((gl_LocalInvocationID.x == 0u)) {
    let x_108 = tint_wgid.x;
    x_105.block_sums[x_108] = chunk[511i];
    chunk[511i] = 0u;
  }
  d_1 = 1i;
  loop {
    if ((d_1 < 512i)) {
    } else {
      break;
    }
    offs = (offs >> bitcast<u32>(1i));
    workgroupBarrier();
    if ((gl_LocalInvocationID.x < bitcast<u32>(d_1))) {
      a_1 = ((offs * ((2u * gl_LocalInvocationID.x) + 1u)) - 1u);
      b_1 = ((offs * ((2u * gl_LocalInvocationID.x) + 2u)) - 1u);
      tmp = chunk[a_1];
      let x_152 = a_1;
      chunk[x_152] = chunk[b_1];
      let x_157 = b_1;
      chunk[x_157] = (chunk[b_1] + tmp);
    }

    continuing {
      d_1 = (d_1 << bitcast<u32>(1i));
    }
  }
  workgroupBarrier();
  let x_166 = gl_GlobalInvocationID.x;
  x_23.vals[(2u * x_166)] = chunk[(2u * gl_LocalInvocationID.x)];
  let x_175 = gl_GlobalInvocationID.x;
  x_23.vals[((2u * x_175) + 1u)] = chunk[((2u * gl_LocalInvocationID.x) + 1u)];
  return;
}

@compute @workgroup_size(256i, 1i, 1i)
fn main(@builtin(local_invocation_id) gl_LocalInvocationID_param : vec3u, @builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u, @builtin(workgroup_id) gl_WorkGroupID_param : vec3u) {
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1(gl_WorkGroupID_param);
}
`;

const block_prefix_sum_comp_spv = `alias RTArr = array<u32>;

struct Data {
  /* @offset(0) */
  vals : RTArr,
}

struct CarryInOut {
  /* @offset(0) */
  carry_in : u32,
  /* @offset(4) */
  carry_out : u32,
}

var<workgroup> chunk : array<u32, 512u>;

var<private> gl_LocalInvocationID : vec3u;

@group(0) @binding(0) var<storage, read_write> x_23 : Data;

var<private> gl_GlobalInvocationID : vec3u;

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
  let x_18 = gl_LocalInvocationID.x;
  chunk[(2u * x_18)] = x_23.vals[(2u * gl_GlobalInvocationID.x)];
  let x_36 = gl_LocalInvocationID.x;
  chunk[((2u * x_36) + 1u)] = x_23.vals[((2u * gl_GlobalInvocationID.x) + 1u)];
  offs = 1u;
  d = 256i;
  loop {
    if ((d > 0i)) {
    } else {
      break;
    }
    workgroupBarrier();
    if ((gl_LocalInvocationID.x < bitcast<u32>(d))) {
      a = ((offs * ((2u * gl_LocalInvocationID.x) + 1u)) - 1u);
      b = ((offs * ((2u * gl_LocalInvocationID.x) + 2u)) - 1u);
      let x_84 = b;
      chunk[x_84] = (chunk[b] + chunk[a]);
    }
    offs = (offs << bitcast<u32>(1i));

    continuing {
      d = (d >> bitcast<u32>(1i));
    }
  }
  if ((gl_LocalInvocationID.x == 0u)) {
    x_104.carry_out = (chunk[511i] + x_104.carry_in);
    chunk[511i] = 0u;
  }
  d_1 = 1i;
  loop {
    if ((d_1 < 512i)) {
    } else {
      break;
    }
    offs = (offs >> bitcast<u32>(1i));
    workgroupBarrier();
    if ((gl_LocalInvocationID.x < bitcast<u32>(d_1))) {
      a_1 = ((offs * ((2u * gl_LocalInvocationID.x) + 1u)) - 1u);
      b_1 = ((offs * ((2u * gl_LocalInvocationID.x) + 2u)) - 1u);
      tmp = chunk[a_1];
      let x_151 = a_1;
      chunk[x_151] = chunk[b_1];
      let x_156 = b_1;
      chunk[x_156] = (chunk[b_1] + tmp);
    }

    continuing {
      d_1 = (d_1 << bitcast<u32>(1i));
    }
  }
  workgroupBarrier();
  let x_165 = gl_GlobalInvocationID.x;
  x_23.vals[(2u * x_165)] = (chunk[(2u * gl_LocalInvocationID.x)] + x_104.carry_in);
  let x_177 = gl_GlobalInvocationID.x;
  x_23.vals[((2u * x_177) + 1u)] = (chunk[((2u * gl_LocalInvocationID.x) + 1u)] + x_104.carry_in);
  return;
}

@compute @workgroup_size(256i, 1i, 1i)
fn main(@builtin(local_invocation_id) gl_LocalInvocationID_param : vec3u, @builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const add_block_sums_comp_spv = `alias RTArr = array<u32>;

struct BlockSums {
  /* @offset(0) */
  block_sums : RTArr,
}

alias RTArr_1 = array<u32>;

struct Data {
  /* @offset(0) */
  vals : RTArr_1,
}

@group(0) @binding(1) var<storage, read_write> x_12 : BlockSums;

@group(0) @binding(0) var<storage, read_write> x_28 : Data;

var<private> gl_GlobalInvocationID : vec3u;

fn main_1(tint_wgid : vec3u) {
  var prev_sum : u32;
  prev_sum = x_12.block_sums[tint_wgid.x];
  let x_33 = (2u * gl_GlobalInvocationID.x);
  x_28.vals[x_33] = (x_28.vals[x_33] + prev_sum);
  let x_43 = ((2u * gl_GlobalInvocationID.x) + 1u);
  x_28.vals[x_43] = (x_28.vals[x_43] + prev_sum);
  return;
}

@compute @workgroup_size(256i, 1i, 1i)
fn main(@builtin(workgroup_id) gl_WorkGroupID_param : vec3u, @builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1(gl_WorkGroupID_param);
}
`;

const stream_compact_comp_spv = `alias RTArr = array<u32>;

struct Input {
  /* @offset(0) */
  inputs : RTArr,
}

alias RTArr_1 = array<u32>;

struct Output {
  /* @offset(0) */
  outputs : RTArr_1,
}

alias RTArr_2 = array<u32>;

struct Offsets {
  /* @offset(0) */
  offsets : RTArr_2,
}

struct CompactionOffset {
  /* @offset(0) */
  compact_offset : u32,
}

@group(0) @binding(0) var<storage, read_write> x_10 : Input;

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(3) var<storage, read_write> x_30 : Output;

@group(0) @binding(1) var<storage, read_write> x_34 : Offsets;

@group(0) @binding(2) var<uniform> x_43 : CompactionOffset;

fn main_1() {
  if ((x_10.inputs[gl_GlobalInvocationID.x] != 0u)) {
    let x_38 = x_34.offsets[gl_GlobalInvocationID.x];
    x_30.outputs[x_38] = (gl_GlobalInvocationID.x + x_43.compact_offset);
  }
  return;
}

@compute @workgroup_size(8i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const stream_compact_data_comp_spv = `struct CompactionOffset {
  /* @offset(0) */
  compact_offset : u32,
}

alias RTArr = array<u32>;

struct Input {
  /* @offset(0) */
  inputs : RTArr,
}

alias RTArr_1 = array<u32>;

struct Output {
  /* @offset(0) */
  outputs : RTArr_1,
}

alias RTArr_2 = array<u32>;

struct Offsets {
  /* @offset(0) */
  offsets : RTArr_2,
}

alias RTArr_3 = array<u32>;

struct Data {
  /* @offset(0) */
  input_data : RTArr_3,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(2) var<uniform> x_18 : CompactionOffset;

@group(0) @binding(0) var<storage, read_write> x_28 : Input;

@group(0) @binding(3) var<storage, read_write> x_39 : Output;

@group(0) @binding(1) var<storage, read_write> x_43 : Offsets;

@group(1) @binding(0) var<storage, read_write> x_50 : Data;

fn main_1() {
  var i : u32;
  i = (gl_GlobalInvocationID.x + x_18.compact_offset);
  if ((x_28.inputs[i] != 0u)) {
    let x_46 = x_43.offsets[i];
    x_39.outputs[x_46] = x_50.input_data[i];
  }
  return;
}

@compute @workgroup_size(8i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const compute_initial_rays_vert_spv = `struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

struct ViewParams {
  /* @offset(0) */
  proj_view : mat4x4f,
  /* @offset(64) */
  eye_pos : vec4f,
  /* @offset(80) */
  eye_dir : vec4f,
  /* @offset(96) */
  near_plane : f32,
}

@group(0) @binding(2) var<uniform> x_17 : VolumeParams;

@group(0) @binding(0) var<uniform> x_36 : ViewParams;

var<private> pos : vec3f;

var<private> transformed_eye : vec3f;

var<private> vray_dir : vec3f;

var<private> gl_Position : vec4f;

fn main_1() {
  var volume_translation : vec3f;
  volume_translation = (vec3f() - (x_17.volume_scale.xyz * 0.5f));
  let x_48 = ((pos * x_17.volume_scale.xyz) + volume_translation);
  gl_Position = (x_36.proj_view * vec4f(x_48.x, x_48.y, x_48.z, 1.0f));
  transformed_eye = ((x_36.eye_pos.xyz - volume_translation) / x_17.volume_scale.xyz);
  vray_dir = (pos - transformed_eye);
  return;
}

struct main_out {
  @builtin(position)
  gl_Position : vec4f,
  @location(1) @interpolate(flat)
  transformed_eye_1 : vec3f,
  @location(0)
  vray_dir_1 : vec3f,
}

@vertex
fn main(@location(0) pos_param : vec3f) -> main_out {
  pos = pos_param;
  main_1();
  return main_out(gl_Position, transformed_eye, vray_dir);
}
`;

const compute_initial_rays_frag_spv = `struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

struct RayInfo {
  /* @offset(0) */
  ray_dir : vec3f,
  /* @offset(12) */
  t : f32,
}

alias RTArr = array<RayInfo>;

struct RayInformation {
  /* @offset(0) */
  rays : RTArr,
}

alias RTArr_1 = array<u32>;

struct RayBlockIDs {
  /* @offset(0) */
  block_ids : RTArr_1,
}

var<private> vray_dir : vec3f;

var<private> transformed_eye : vec3f;

@group(0) @binding(2) var<uniform> x_80 : VolumeParams;

var<private> gl_FragCoord : vec4f;

@group(0) @binding(1) var<storage, read_write> x_149 : RayInformation;

@group(0) @binding(3) var<storage, read_write> x_157 : RayBlockIDs;

fn intersect_box_vf3_vf3_vf3_vf3_(orig : ptr<function, vec3f>, dir : ptr<function, vec3f>, box_min : vec3f, box_max : vec3f) -> vec2f {
  var inv_dir : vec3f;
  var tmin_tmp : vec3f;
  var tmax_tmp : vec3f;
  var tmin : vec3f;
  var tmax : vec3f;
  var t0 : f32;
  var t1 : f32;
  inv_dir = (vec3f(1.0f) / *(dir));
  tmin_tmp = ((box_min - *(orig)) * inv_dir);
  tmax_tmp = ((box_max - *(orig)) * inv_dir);
  tmin = min(tmin_tmp, tmax_tmp);
  tmax = max(tmin_tmp, tmax_tmp);
  t0 = max(tmin.x, max(tmin.y, tmin.z));
  t1 = min(tmax.x, min(tmax.y, tmax.z));
  let x_63 = t0;
  let x_64 = t1;
  return vec2f(x_63, x_64);
}

fn main_1() {
  var ray_dir : vec3f;
  var vol_eye : vec3f;
  var grid_ray_dir : vec3f;
  var t_hit : vec2f;
  var param : vec3f;
  var param_1 : vec3f;
  var pixel : u32;
  ray_dir = normalize(vray_dir);
  vol_eye = ((transformed_eye * vec3f(x_80.volume_dims.xyz)) - vec3f(0.5f));
  grid_ray_dir = normalize((ray_dir * vec3f(x_80.volume_dims.xyz)));
  let x_106 = x_80.volume_dims;
  param = vol_eye;
  param_1 = grid_ray_dir;
  let x_115 = intersect_box_vf3_vf3_vf3_vf3_(&(param), &(param_1), vec3f(), vec3f((x_106.xyz - vec3u(1u))));
  t_hit = x_115;
  t_hit.x = max(t_hit.x, 0.0f);
  pixel = (u32(gl_FragCoord.x) + (x_80.image_width * u32(gl_FragCoord.y)));
  if ((t_hit.x < t_hit.y)) {
    let x_150 = pixel;
    x_149.rays[x_150].ray_dir = grid_ray_dir;
    let x_158 = pixel;
    x_157.block_ids[x_158] = 4294967295u;
    let x_161 = pixel;
    x_149.rays[x_161].t = t_hit.x;
  }
  return;
}

@fragment
fn main(@location(0) vray_dir_param : vec3f, @location(1) @interpolate(flat) transformed_eye_param : vec3f, @builtin(position) gl_FragCoord_param : vec4f) {
  vray_dir = vray_dir_param;
  transformed_eye = transformed_eye_param;
  gl_FragCoord = gl_FragCoord_param;
  main_1();
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
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

struct EmulateUint64_1 {
  /* @offset(0) */
  lo : u32,
  /* @offset(4) */
  hi : u32,
}

alias RTArr = array<EmulateUint64_1>;

struct Compressed {
  /* @offset(0) */
  compressed : RTArr,
}

struct BlockIDOffset {
  /* @offset(0) */
  block_id_offset : u32,
}

alias RTArr_1 = array<vec2f>;

struct BlockInformation {
  /* @offset(0) */
  block_ranges : RTArr_1,
}

@group(0) @binding(1) var<uniform> x_240 : VolumeParams;

@group(0) @binding(0) var<storage, read_write> x_270 : Compressed;

var<private> gl_GlobalInvocationID : vec3u;

@group(1) @binding(0) var<uniform> x_872 : BlockIDOffset;

@group(0) @binding(2) var<storage, read_write> x_1073 : BlockInformation;

fn shift_right_struct_EmulateUint64_u1_u11_u1_(a_3 : EmulateUint64, n_1 : ptr<function, u32>) -> EmulateUint64 {
  var carry_1 : u32;
  var b_3 : EmulateUint64;
  if ((*(n_1) == 0u)) {
    return a_3;
  }
  if ((*(n_1) < 32u)) {
    carry_1 = (a_3.hi & (4294967295u >> (32u - *(n_1))));
    b_3.lo = ((a_3.lo >> *(n_1)) | (carry_1 << (32u - *(n_1))));
    b_3.hi = (a_3.hi >> *(n_1));
  } else {
    b_3.lo = (a_3.hi >> (*(n_1) - 32u));
    b_3.hi = 0u;
  }
  let x_203 = b_3;
  return x_203;
}

fn create_block_reader_u1_(block_index : ptr<function, u32>) -> BlockReader {
  var reader_5 : BlockReader;
  var param_2 : u32;
  if ((x_240.max_bits != 64u)) {
    reader_5.current_word = ((*(block_index) * x_240.max_bits) / 64u);
    reader_5.current_bit = ((*(block_index) * x_240.max_bits) % 64u);
  } else {
    reader_5.current_word = *(block_index);
    reader_5.current_bit = 0u;
  }
  let x_275 = x_270.compressed[reader_5.current_word];
  reader_5.word_buffer.lo = x_275.lo;
  reader_5.word_buffer.hi = x_275.hi;
  let x_282 = reader_5.word_buffer;
  param_2 = reader_5.current_bit;
  let x_286 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_282, &(param_2));
  reader_5.word_buffer = x_286;
  let x_288 = reader_5;
  return x_288;
}

fn advance_word_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(reader : ptr<function, BlockReader>) {
  (*(reader)).current_bit = 0u;
  (*(reader)).current_word = ((*(reader)).current_word + bitcast<u32>(1i));
  let x_298 = x_270.compressed[(*(reader)).current_word];
  (*(reader)).word_buffer.lo = x_298.lo;
  (*(reader)).word_buffer.hi = x_298.hi;
  return;
}

fn read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(reader_1 : ptr<function, BlockReader>) -> u32 {
  var bit : u32;
  var param_3 : u32;
  var param_4 : BlockReader;
  bit = ((*(reader_1)).word_buffer.lo & 1u);
  (*(reader_1)).current_bit = ((*(reader_1)).current_bit + bitcast<u32>(1i));
  let x_313 = (*(reader_1)).word_buffer;
  param_3 = 1u;
  let x_315 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_313, &(param_3));
  (*(reader_1)).word_buffer = x_315;
  if (((*(reader_1)).current_bit >= 64u)) {
    param_4 = *(reader_1);
    advance_word_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_4));
    *(reader_1) = param_4;
  }
  let x_326 = bit;
  return x_326;
}

fn make_emulate_uint64_u1_u1_(hi : ptr<function, u32>, lo : ptr<function, u32>) -> EmulateUint64 {
  var a_4 : EmulateUint64;
  a_4.lo = *(lo);
  a_4.hi = *(hi);
  let x_97 = a_4;
  return x_97;
}

fn make_mask_u1_(n_2 : ptr<function, u32>) -> EmulateUint64 {
  var a_5 : EmulateUint64;
  var param : u32;
  var param_1 : u32;
  param = 0u;
  param_1 = 0u;
  let x_209 = make_emulate_uint64_u1_u1_(&(param), &(param_1));
  a_5 = x_209;
  if (((*(n_2) > 0u) & (*(n_2) < 65u))) {
    if ((*(n_2) > 32u)) {
      a_5.lo = 4294967295u;
      a_5.hi = (4294967295u >> (64u - *(n_2)));
    } else {
      a_5.lo = (4294967295u >> (32u - *(n_2)));
      a_5.hi = 0u;
    }
  }
  let x_233 = a_5;
  return x_233;
}

fn bitwise_and_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(a : EmulateUint64, b : EmulateUint64) -> EmulateUint64 {
  var c : EmulateUint64;
  c.lo = (a.lo & b.lo);
  c.hi = (a.hi & b.hi);
  let x_109 = c;
  return x_109;
}

fn shift_left_struct_EmulateUint64_u1_u11_u1_(a_2 : EmulateUint64, n : ptr<function, u32>) -> EmulateUint64 {
  var carry : u32;
  var b_2 : EmulateUint64;
  if ((*(n) == 0u)) {
    return a_2;
  }
  if ((*(n) < 32u)) {
    carry = (a_2.lo & (4294967295u << (32u - *(n))));
    b_2.lo = (a_2.lo << *(n));
    b_2.hi = ((a_2.hi << *(n)) | (carry >> (32u - *(n))));
  } else {
    b_2.lo = 0u;
    b_2.hi = (a_2.lo << (*(n) - 32u));
  }
  let x_164 = b_2;
  return x_164;
}

fn bitwise_or_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(a_1 : EmulateUint64, b_1 : EmulateUint64) -> EmulateUint64 {
  var c_1 : EmulateUint64;
  c_1.lo = (a_1.lo | b_1.lo);
  c_1.hi = (a_1.hi | b_1.hi);
  let x_121 = c_1;
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
  rem_bits = (64u - (*(reader_2)).current_bit);
  first_read = min(rem_bits, n_bits);
  param_5 = first_read;
  let x_339 = make_mask_u1_(&(param_5));
  mask = x_339;
  let x_342 = (*(reader_2)).word_buffer;
  let x_343 = mask;
  let x_344 = bitwise_and_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_342, x_343);
  bits = x_344;
  let x_346 = (*(reader_2)).word_buffer;
  param_6 = n_bits;
  let x_348 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_346, &(param_6));
  (*(reader_2)).word_buffer = x_348;
  (*(reader_2)).current_bit = ((*(reader_2)).current_bit + first_read);
  next_read = 0u;
  if ((n_bits >= rem_bits)) {
    param_7 = *(reader_2);
    advance_word_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_7));
    *(reader_2) = param_7;
    next_read = (n_bits - first_read);
  }
  param_8 = next_read;
  let x_368 = make_mask_u1_(&(param_8));
  mask = x_368;
  let x_369 = bits;
  let x_371 = (*(reader_2)).word_buffer;
  let x_372 = mask;
  let x_373 = bitwise_and_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_371, x_372);
  param_9 = first_read;
  let x_376 = shift_left_struct_EmulateUint64_u1_u11_u1_(x_373, &(param_9));
  let x_377 = bitwise_or_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_369, x_376);
  bits = x_377;
  let x_379 = (*(reader_2)).word_buffer;
  param_10 = next_read;
  let x_382 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_379, &(param_10));
  (*(reader_2)).word_buffer = x_382;
  (*(reader_2)).current_bit = ((*(reader_2)).current_bit + next_read);
  let x_389 = bits;
  return x_389;
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
    if ((i < 64u)) {
    } else {
      break;
    }
    let x_407 = i;
    (*(block_1))[x_407] = 0u;

    continuing {
      i = (i + bitcast<u32>(1i));
    }
  }
  param_11 = 0u;
  param_12 = 0u;
  let x_414 = make_emulate_uint64_u1_u1_(&(param_11), &(param_12));
  x_1 = x_414;
  param_13 = 0u;
  param_14 = 1u;
  let x_418 = make_emulate_uint64_u1_u1_(&(param_13), &(param_14));
  one = x_418;
  bits_1 = block_max_bits;
  k = 32u;
  n_3 = 0u;
  loop {
    var x_433 : bool;
    var x_434 : bool;
    let x_428 = (bits_1 != 0u);
    x_434 = x_428;
    if (x_428) {
      let x_431 = k;
      k = (k - bitcast<u32>(1i));
      x_433 = (x_431 > 0u);
      x_434 = x_433;
    }
    if (x_434) {
    } else {
      break;
    }
    m = min(n_3, bits_1);
    bits_1 = (bits_1 - m);
    let x_442 = m;
    param_15 = *(reader_3);
    let x_445 = read_bits_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_(&(param_15), x_442);
    *(reader_3) = param_15;
    x_1 = x_445;
    loop {
      var x_465 : bool;
      var x_466 : bool;
      let x_456 = ((n_3 < 64u) & (bits_1 != 0u));
      x_466 = x_456;
      if (x_456) {
        bits_1 = (bits_1 - bitcast<u32>(1i));
        param_16 = *(reader_3);
        let x_463 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_16));
        *(reader_3) = param_16;
        x_465 = (x_463 != 0u);
        x_466 = x_465;
      }
      if (x_466) {
      } else {
        break;
      }
      loop {
        var x_486 : bool;
        var x_487 : bool;
        let x_477 = ((n_3 < 63u) & (bits_1 != 0u));
        x_487 = x_477;
        if (x_477) {
          bits_1 = (bits_1 - bitcast<u32>(1i));
          param_17 = *(reader_3);
          let x_484 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_17));
          *(reader_3) = param_17;
          x_486 = (x_484 == 0u);
          x_487 = x_486;
        }
        if (x_487) {
        } else {
          break;
        }

        continuing {
          n_3 = (n_3 + bitcast<u32>(1i));
        }
      }

      continuing {
        let x_490 = x_1;
        let x_491 = one;
        let x_492 = n_3;
        n_3 = (n_3 + bitcast<u32>(1i));
        param_18 = x_492;
        let x_495 = shift_left_struct_EmulateUint64_u1_u11_u1_(x_491, &(param_18));
        let x_496 = bitwise_or_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_490, x_495);
        x_1 = x_496;
      }
    }
    i_1 = 0u;
    loop {
      if ((i_1 < 64u)) {
      } else {
        break;
      }
      let x_505 = i_1;
      (*(block_1))[x_505] = ((*(block_1))[i_1] + ((x_1.lo & 1u) << k));

      continuing {
        i_1 = (i_1 + bitcast<u32>(1i));
        let x_517 = x_1;
        param_19 = 1u;
        let x_519 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_517, &(param_19));
        x_1 = x_519;
      }
    }
  }
  return;
}

fn uint2int_u1_(x : ptr<function, u32>) -> i32 {
  let x_392 = *(x);
  return bitcast<i32>(((x_392 ^ 2863311530u) - 2863311530u));
}

fn inverse_lift_i1_64__u1_u1_(block_2 : ptr<function, array<i32, 64u>>, s : u32, idx : u32) {
  var i_2 : u32;
  var v : vec4i;
  var i_3 : u32;
  i_2 = 0u;
  loop {
    if ((i_2 < 4u)) {
    } else {
      break;
    }
    let x_532 = i_2;
    v[x_532] = (*(block_2))[(idx + (i_2 * s))];

    continuing {
      i_2 = (i_2 + bitcast<u32>(1i));
    }
  }
  v.y = (v.y + (v.w >> bitcast<u32>(1i)));
  v.w = (v.w - (v.y >> bitcast<u32>(1i)));
  v.y = (v.y + v.w);
  v.w = (v.w << bitcast<u32>(1i));
  v.w = (v.w - v.y);
  v.z = (v.z + v.x);
  v.x = (v.x << bitcast<u32>(1i));
  v.x = (v.x - v.z);
  v.y = (v.y + v.z);
  v.z = (v.z << bitcast<u32>(1i));
  v.z = (v.z - v.y);
  v.w = (v.w + v.x);
  v.x = (v.x << bitcast<u32>(1i));
  v.x = (v.x - v.w);
  i_3 = 0u;
  loop {
    if ((i_3 < 4u)) {
    } else {
      break;
    }
    let x_630 = i_3;
    (*(block_2))[(idx + (x_630 * s))] = v[i_3];

    continuing {
      i_3 = (i_3 + bitcast<u32>(1i));
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
    if ((y < 4u)) {
    } else {
      break;
    }
    x_2 = 0u;
    loop {
      if ((x_2 < 4u)) {
      } else {
        break;
      }
      let x_656 = x_2;
      let x_657 = y;
      param_20 = *(block_3);
      inverse_lift_i1_64__u1_u1_(&(param_20), 16u, (x_656 + (4u * x_657)));
      *(block_3) = param_20;

      continuing {
        x_2 = (x_2 + bitcast<u32>(1i));
      }
    }

    continuing {
      y = (y + bitcast<u32>(1i));
    }
  }
  x_3 = 0u;
  loop {
    if ((x_3 < 4u)) {
    } else {
      break;
    }
    z = 0u;
    loop {
      if ((z < 4u)) {
      } else {
        break;
      }
      let x_684 = z;
      let x_686 = x_3;
      param_21 = *(block_3);
      inverse_lift_i1_64__u1_u1_(&(param_21), 4u, ((16u * x_684) + x_686));
      *(block_3) = param_21;

      continuing {
        z = (z + bitcast<u32>(1i));
      }
    }

    continuing {
      x_3 = (x_3 + bitcast<u32>(1i));
    }
  }
  z_1 = 0u;
  loop {
    if ((z_1 < 4u)) {
    } else {
      break;
    }
    y_1 = 0u;
    loop {
      if ((y_1 < 4u)) {
      } else {
        break;
      }
      let x_712 = y_1;
      let x_714 = z_1;
      param_22 = *(block_3);
      inverse_lift_i1_64__u1_u1_(&(param_22), 1u, ((4u * x_712) + (16u * x_714)));
      *(block_3) = param_22;

      continuing {
        y_1 = (y_1 + bitcast<u32>(1i));
      }
    }

    continuing {
      z_1 = (z_1 + bitcast<u32>(1i));
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
  param_23 = *(reader_4);
  let x_728 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_23));
  *(reader_4) = param_23;
  s_cont = x_728;
  if ((s_cont != 0u)) {
    param_24 = *(reader_4);
    let x_738 = read_bits_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_(&(param_24), 8u);
    *(reader_4) = param_24;
    emax = bitcast<i32>((x_738.lo - 127u));
    block_max_bits_1 = (x_240.max_bits - 9u);
    let x_749 = block_max_bits_1;
    param_25 = *(reader_4);
    param_26 = uint_block;
    decode_ints_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_u1_64__(&(param_25), x_749, &(param_26));
    *(reader_4) = param_25;
    uint_block = param_26;
    i_4 = 0u;
    loop {
      if ((i_4 < 64u)) {
      } else {
        break;
      }
      let x_822 = i_4;
      indexable = array<u32, 64u>(0u, 1u, 4u, 16u, 20u, 17u, 5u, 2u, 8u, 32u, 21u, 6u, 18u, 24u, 9u, 33u, 36u, 3u, 12u, 48u, 22u, 25u, 37u, 40u, 34u, 10u, 7u, 19u, 28u, 13u, 49u, 52u, 41u, 38u, 26u, 23u, 29u, 53u, 11u, 35u, 44u, 14u, 50u, 56u, 42u, 27u, 39u, 45u, 30u, 54u, 57u, 60u, 51u, 15u, 43u, 46u, 58u, 61u, 55u, 31u, 62u, 59u, 47u, 63u);
      let x_825 = indexable[x_822];
      param_27 = uint_block[i_4];
      let x_830 = uint2int_u1_(&(param_27));
      int_block[x_825] = x_830;

      continuing {
        i_4 = (i_4 + bitcast<u32>(1i));
      }
    }
    param_28 = int_block;
    inverse_transform_i1_64__(&(param_28));
    int_block = param_28;
    inv_w = ldexp(1.0f, (emax - 30i));
    i_5 = 0u;
    loop {
      if ((i_5 < 64u)) {
      } else {
        break;
      }
      let x_853 = i_5;
      (*(decompressed_block))[x_853] = (inv_w * f32(int_block[i_5]));

      continuing {
        i_5 = (i_5 + bitcast<u32>(1i));
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
  var stride : vec3u;
  var nblocks : vec3u;
  var block_4 : vec3u;
  var block_range : vec2f;
  var partial : vec3<bool>;
  var partial_size : vec3u;
  var x_973 : u32;
  var x_985 : u32;
  var x_997 : u32;
  var z_2 : u32;
  var y_2 : u32;
  var x_4 : u32;
  block_index_1 = (gl_GlobalInvocationID.x + (x_872.block_id_offset * 32u));
  total_blocks = (((x_240.padded_dims.x * x_240.padded_dims.y) / 64u) * x_240.padded_dims.z);
  if ((block_index_1 >= total_blocks)) {
    return;
  }
  param_29 = block_index_1;
  let x_896 = create_block_reader_u1_(&(param_29));
  reader_6 = x_896;
  param_30 = reader_6;
  param_31 = decompressed_block_1;
  decompress_block_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_f1_64__(&(param_30), &(param_31));
  decompressed_block_1 = param_31;
  stride = vec3u(1u, x_240.volume_dims.x, (x_240.volume_dims.x * x_240.volume_dims.y));
  nblocks.x = (x_240.padded_dims.x >> bitcast<u32>(2i));
  nblocks.y = (x_240.padded_dims.y >> bitcast<u32>(2i));
  nblocks.z = (x_240.padded_dims.z >> bitcast<u32>(2i));
  block_4.x = ((block_index_1 % nblocks.x) * 4u);
  block_4.y = (((block_index_1 / nblocks.x) % nblocks.y) * 4u);
  block_4.z = ((block_index_1 / (nblocks.x * nblocks.y)) * 4u);
  block_range = vec2f(100000002004087734272.0f, -100000002004087734272.0f);
  partial = ((block_4 + vec3u(4u)) > x_240.volume_dims.xyz);
  if (partial.x) {
    x_973 = (x_240.volume_dims.x - block_4.x);
  } else {
    x_973 = 4u;
  }
  let x_982 = x_973;
  if (partial.y) {
    x_985 = (x_240.volume_dims.y - block_4.y);
  } else {
    x_985 = 4u;
  }
  let x_994 = x_985;
  if (partial.z) {
    x_997 = (x_240.volume_dims.z - block_4.z);
  } else {
    x_997 = 4u;
  }
  partial_size = vec3u(x_982, x_994, x_997);
  z_2 = 0u;
  loop {
    if ((z_2 < partial_size.z)) {
    } else {
      break;
    }
    y_2 = 0u;
    loop {
      if ((y_2 < partial_size.y)) {
      } else {
        break;
      }
      x_4 = 0u;
      loop {
        if ((x_4 < partial_size.x)) {
        } else {
          break;
        }
        block_range.x = min(block_range.x, decompressed_block_1[(((16u * z_2) + (4u * y_2)) + x_4)]);
        block_range.y = max(block_range.y, decompressed_block_1[(((16u * z_2) + (4u * y_2)) + x_4)]);

        continuing {
          x_4 = (x_4 + bitcast<u32>(1i));
        }
      }

      continuing {
        y_2 = (y_2 + bitcast<u32>(1i));
      }
    }

    continuing {
      z_2 = (z_2 + bitcast<u32>(1i));
    }
  }
  let x_1074 = block_index_1;
  x_1073.block_ranges[x_1074] = block_range;
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
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
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

struct EmulateUint64_1 {
  /* @offset(0) */
  lo : u32,
  /* @offset(4) */
  hi : u32,
}

alias RTArr = array<EmulateUint64_1>;

struct Compressed {
  /* @offset(0) */
  compressed : RTArr,
}

struct DecompressBlockOffset {
  /* @offset(0) */
  start_block_offset : u32,
  /* @offset(4) */
  total_n_blocks : u32,
}

alias RTArr_1 = array<u32>;

struct BlockIDs {
  /* @offset(0) */
  block_ids : RTArr_1,
}

alias RTArr_2 = array<u32>;

struct CachedItemSlots {
  /* @offset(0) */
  cached_item_slots : RTArr_2,
}

alias RTArr_3 = array<f32>;

struct Decompressed {
  /* @offset(0) */
  decompressed : RTArr_3,
}

@group(0) @binding(1) var<uniform> x_240 : VolumeParams;

@group(0) @binding(0) var<storage, read_write> x_270 : Compressed;

@group(1) @binding(0) var<uniform> x_865 : DecompressBlockOffset;

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(3) var<storage, read_write> x_885 : BlockIDs;

@group(0) @binding(4) var<storage, read_write> x_897 : CachedItemSlots;

@group(0) @binding(2) var<storage, read_write> x_923 : Decompressed;

fn shift_right_struct_EmulateUint64_u1_u11_u1_(a_3 : EmulateUint64, n_1 : ptr<function, u32>) -> EmulateUint64 {
  var carry_1 : u32;
  var b_3 : EmulateUint64;
  if ((*(n_1) == 0u)) {
    return a_3;
  }
  if ((*(n_1) < 32u)) {
    carry_1 = (a_3.hi & (4294967295u >> (32u - *(n_1))));
    b_3.lo = ((a_3.lo >> *(n_1)) | (carry_1 << (32u - *(n_1))));
    b_3.hi = (a_3.hi >> *(n_1));
  } else {
    b_3.lo = (a_3.hi >> (*(n_1) - 32u));
    b_3.hi = 0u;
  }
  let x_203 = b_3;
  return x_203;
}

fn create_block_reader_u1_(block_index : ptr<function, u32>) -> BlockReader {
  var reader_5 : BlockReader;
  var param_2 : u32;
  if ((x_240.max_bits != 64u)) {
    reader_5.current_word = ((*(block_index) * x_240.max_bits) / 64u);
    reader_5.current_bit = ((*(block_index) * x_240.max_bits) % 64u);
  } else {
    reader_5.current_word = *(block_index);
    reader_5.current_bit = 0u;
  }
  let x_275 = x_270.compressed[reader_5.current_word];
  reader_5.word_buffer.lo = x_275.lo;
  reader_5.word_buffer.hi = x_275.hi;
  let x_282 = reader_5.word_buffer;
  param_2 = reader_5.current_bit;
  let x_286 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_282, &(param_2));
  reader_5.word_buffer = x_286;
  let x_288 = reader_5;
  return x_288;
}

fn advance_word_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(reader : ptr<function, BlockReader>) {
  (*(reader)).current_bit = 0u;
  (*(reader)).current_word = ((*(reader)).current_word + bitcast<u32>(1i));
  let x_298 = x_270.compressed[(*(reader)).current_word];
  (*(reader)).word_buffer.lo = x_298.lo;
  (*(reader)).word_buffer.hi = x_298.hi;
  return;
}

fn read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(reader_1 : ptr<function, BlockReader>) -> u32 {
  var bit : u32;
  var param_3 : u32;
  var param_4 : BlockReader;
  bit = ((*(reader_1)).word_buffer.lo & 1u);
  (*(reader_1)).current_bit = ((*(reader_1)).current_bit + bitcast<u32>(1i));
  let x_313 = (*(reader_1)).word_buffer;
  param_3 = 1u;
  let x_315 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_313, &(param_3));
  (*(reader_1)).word_buffer = x_315;
  if (((*(reader_1)).current_bit >= 64u)) {
    param_4 = *(reader_1);
    advance_word_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_4));
    *(reader_1) = param_4;
  }
  let x_326 = bit;
  return x_326;
}

fn make_emulate_uint64_u1_u1_(hi : ptr<function, u32>, lo : ptr<function, u32>) -> EmulateUint64 {
  var a_4 : EmulateUint64;
  a_4.lo = *(lo);
  a_4.hi = *(hi);
  let x_97 = a_4;
  return x_97;
}

fn make_mask_u1_(n_2 : ptr<function, u32>) -> EmulateUint64 {
  var a_5 : EmulateUint64;
  var param : u32;
  var param_1 : u32;
  param = 0u;
  param_1 = 0u;
  let x_209 = make_emulate_uint64_u1_u1_(&(param), &(param_1));
  a_5 = x_209;
  if (((*(n_2) > 0u) & (*(n_2) < 65u))) {
    if ((*(n_2) > 32u)) {
      a_5.lo = 4294967295u;
      a_5.hi = (4294967295u >> (64u - *(n_2)));
    } else {
      a_5.lo = (4294967295u >> (32u - *(n_2)));
      a_5.hi = 0u;
    }
  }
  let x_233 = a_5;
  return x_233;
}

fn bitwise_and_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(a : EmulateUint64, b : EmulateUint64) -> EmulateUint64 {
  var c : EmulateUint64;
  c.lo = (a.lo & b.lo);
  c.hi = (a.hi & b.hi);
  let x_109 = c;
  return x_109;
}

fn shift_left_struct_EmulateUint64_u1_u11_u1_(a_2 : EmulateUint64, n : ptr<function, u32>) -> EmulateUint64 {
  var carry : u32;
  var b_2 : EmulateUint64;
  if ((*(n) == 0u)) {
    return a_2;
  }
  if ((*(n) < 32u)) {
    carry = (a_2.lo & (4294967295u << (32u - *(n))));
    b_2.lo = (a_2.lo << *(n));
    b_2.hi = ((a_2.hi << *(n)) | (carry >> (32u - *(n))));
  } else {
    b_2.lo = 0u;
    b_2.hi = (a_2.lo << (*(n) - 32u));
  }
  let x_164 = b_2;
  return x_164;
}

fn bitwise_or_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(a_1 : EmulateUint64, b_1 : EmulateUint64) -> EmulateUint64 {
  var c_1 : EmulateUint64;
  c_1.lo = (a_1.lo | b_1.lo);
  c_1.hi = (a_1.hi | b_1.hi);
  let x_121 = c_1;
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
  rem_bits = (64u - (*(reader_2)).current_bit);
  first_read = min(rem_bits, n_bits);
  param_5 = first_read;
  let x_339 = make_mask_u1_(&(param_5));
  mask = x_339;
  let x_342 = (*(reader_2)).word_buffer;
  let x_343 = mask;
  let x_344 = bitwise_and_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_342, x_343);
  bits = x_344;
  let x_346 = (*(reader_2)).word_buffer;
  param_6 = n_bits;
  let x_348 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_346, &(param_6));
  (*(reader_2)).word_buffer = x_348;
  (*(reader_2)).current_bit = ((*(reader_2)).current_bit + first_read);
  next_read = 0u;
  if ((n_bits >= rem_bits)) {
    param_7 = *(reader_2);
    advance_word_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_7));
    *(reader_2) = param_7;
    next_read = (n_bits - first_read);
  }
  param_8 = next_read;
  let x_368 = make_mask_u1_(&(param_8));
  mask = x_368;
  let x_369 = bits;
  let x_371 = (*(reader_2)).word_buffer;
  let x_372 = mask;
  let x_373 = bitwise_and_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_371, x_372);
  param_9 = first_read;
  let x_376 = shift_left_struct_EmulateUint64_u1_u11_u1_(x_373, &(param_9));
  let x_377 = bitwise_or_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_369, x_376);
  bits = x_377;
  let x_379 = (*(reader_2)).word_buffer;
  param_10 = next_read;
  let x_382 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_379, &(param_10));
  (*(reader_2)).word_buffer = x_382;
  (*(reader_2)).current_bit = ((*(reader_2)).current_bit + next_read);
  let x_389 = bits;
  return x_389;
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
    if ((i < 64u)) {
    } else {
      break;
    }
    let x_407 = i;
    (*(block_1))[x_407] = 0u;

    continuing {
      i = (i + bitcast<u32>(1i));
    }
  }
  param_11 = 0u;
  param_12 = 0u;
  let x_414 = make_emulate_uint64_u1_u1_(&(param_11), &(param_12));
  x_1 = x_414;
  param_13 = 0u;
  param_14 = 1u;
  let x_418 = make_emulate_uint64_u1_u1_(&(param_13), &(param_14));
  one = x_418;
  bits_1 = block_max_bits;
  k = 32u;
  n_3 = 0u;
  loop {
    var x_433 : bool;
    var x_434 : bool;
    let x_428 = (bits_1 != 0u);
    x_434 = x_428;
    if (x_428) {
      let x_431 = k;
      k = (k - bitcast<u32>(1i));
      x_433 = (x_431 > 0u);
      x_434 = x_433;
    }
    if (x_434) {
    } else {
      break;
    }
    m = min(n_3, bits_1);
    bits_1 = (bits_1 - m);
    let x_442 = m;
    param_15 = *(reader_3);
    let x_445 = read_bits_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_(&(param_15), x_442);
    *(reader_3) = param_15;
    x_1 = x_445;
    loop {
      var x_465 : bool;
      var x_466 : bool;
      let x_456 = ((n_3 < 64u) & (bits_1 != 0u));
      x_466 = x_456;
      if (x_456) {
        bits_1 = (bits_1 - bitcast<u32>(1i));
        param_16 = *(reader_3);
        let x_463 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_16));
        *(reader_3) = param_16;
        x_465 = (x_463 != 0u);
        x_466 = x_465;
      }
      if (x_466) {
      } else {
        break;
      }
      loop {
        var x_486 : bool;
        var x_487 : bool;
        let x_477 = ((n_3 < 63u) & (bits_1 != 0u));
        x_487 = x_477;
        if (x_477) {
          bits_1 = (bits_1 - bitcast<u32>(1i));
          param_17 = *(reader_3);
          let x_484 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_17));
          *(reader_3) = param_17;
          x_486 = (x_484 == 0u);
          x_487 = x_486;
        }
        if (x_487) {
        } else {
          break;
        }

        continuing {
          n_3 = (n_3 + bitcast<u32>(1i));
        }
      }

      continuing {
        let x_490 = x_1;
        let x_491 = one;
        let x_492 = n_3;
        n_3 = (n_3 + bitcast<u32>(1i));
        param_18 = x_492;
        let x_495 = shift_left_struct_EmulateUint64_u1_u11_u1_(x_491, &(param_18));
        let x_496 = bitwise_or_struct_EmulateUint64_u1_u11_struct_EmulateUint64_u1_u11_(x_490, x_495);
        x_1 = x_496;
      }
    }
    i_1 = 0u;
    loop {
      if ((i_1 < 64u)) {
      } else {
        break;
      }
      let x_505 = i_1;
      (*(block_1))[x_505] = ((*(block_1))[i_1] + ((x_1.lo & 1u) << k));

      continuing {
        i_1 = (i_1 + bitcast<u32>(1i));
        let x_517 = x_1;
        param_19 = 1u;
        let x_519 = shift_right_struct_EmulateUint64_u1_u11_u1_(x_517, &(param_19));
        x_1 = x_519;
      }
    }
  }
  return;
}

fn uint2int_u1_(x : ptr<function, u32>) -> i32 {
  let x_392 = *(x);
  return bitcast<i32>(((x_392 ^ 2863311530u) - 2863311530u));
}

fn inverse_lift_i1_64__u1_u1_(block_2 : ptr<function, array<i32, 64u>>, s : u32, idx : u32) {
  var i_2 : u32;
  var v : vec4i;
  var i_3 : u32;
  i_2 = 0u;
  loop {
    if ((i_2 < 4u)) {
    } else {
      break;
    }
    let x_532 = i_2;
    v[x_532] = (*(block_2))[(idx + (i_2 * s))];

    continuing {
      i_2 = (i_2 + bitcast<u32>(1i));
    }
  }
  v.y = (v.y + (v.w >> bitcast<u32>(1i)));
  v.w = (v.w - (v.y >> bitcast<u32>(1i)));
  v.y = (v.y + v.w);
  v.w = (v.w << bitcast<u32>(1i));
  v.w = (v.w - v.y);
  v.z = (v.z + v.x);
  v.x = (v.x << bitcast<u32>(1i));
  v.x = (v.x - v.z);
  v.y = (v.y + v.z);
  v.z = (v.z << bitcast<u32>(1i));
  v.z = (v.z - v.y);
  v.w = (v.w + v.x);
  v.x = (v.x << bitcast<u32>(1i));
  v.x = (v.x - v.w);
  i_3 = 0u;
  loop {
    if ((i_3 < 4u)) {
    } else {
      break;
    }
    let x_630 = i_3;
    (*(block_2))[(idx + (x_630 * s))] = v[i_3];

    continuing {
      i_3 = (i_3 + bitcast<u32>(1i));
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
    if ((y < 4u)) {
    } else {
      break;
    }
    x_2 = 0u;
    loop {
      if ((x_2 < 4u)) {
      } else {
        break;
      }
      let x_656 = x_2;
      let x_657 = y;
      param_20 = *(block_3);
      inverse_lift_i1_64__u1_u1_(&(param_20), 16u, (x_656 + (4u * x_657)));
      *(block_3) = param_20;

      continuing {
        x_2 = (x_2 + bitcast<u32>(1i));
      }
    }

    continuing {
      y = (y + bitcast<u32>(1i));
    }
  }
  x_3 = 0u;
  loop {
    if ((x_3 < 4u)) {
    } else {
      break;
    }
    z = 0u;
    loop {
      if ((z < 4u)) {
      } else {
        break;
      }
      let x_684 = z;
      let x_686 = x_3;
      param_21 = *(block_3);
      inverse_lift_i1_64__u1_u1_(&(param_21), 4u, ((16u * x_684) + x_686));
      *(block_3) = param_21;

      continuing {
        z = (z + bitcast<u32>(1i));
      }
    }

    continuing {
      x_3 = (x_3 + bitcast<u32>(1i));
    }
  }
  z_1 = 0u;
  loop {
    if ((z_1 < 4u)) {
    } else {
      break;
    }
    y_1 = 0u;
    loop {
      if ((y_1 < 4u)) {
      } else {
        break;
      }
      let x_712 = y_1;
      let x_714 = z_1;
      param_22 = *(block_3);
      inverse_lift_i1_64__u1_u1_(&(param_22), 1u, ((4u * x_712) + (16u * x_714)));
      *(block_3) = param_22;

      continuing {
        y_1 = (y_1 + bitcast<u32>(1i));
      }
    }

    continuing {
      z_1 = (z_1 + bitcast<u32>(1i));
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
  param_23 = *(reader_4);
  let x_728 = read_bit_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_(&(param_23));
  *(reader_4) = param_23;
  s_cont = x_728;
  if ((s_cont != 0u)) {
    param_24 = *(reader_4);
    let x_738 = read_bits_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_(&(param_24), 8u);
    *(reader_4) = param_24;
    emax = bitcast<i32>((x_738.lo - 127u));
    block_max_bits_1 = (x_240.max_bits - 9u);
    let x_749 = block_max_bits_1;
    param_25 = *(reader_4);
    param_26 = uint_block;
    decode_ints_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_u1_u1_64__(&(param_25), x_749, &(param_26));
    *(reader_4) = param_25;
    uint_block = param_26;
    i_4 = 0u;
    loop {
      if ((i_4 < 64u)) {
      } else {
        break;
      }
      let x_822 = i_4;
      indexable = array<u32, 64u>(0u, 1u, 4u, 16u, 20u, 17u, 5u, 2u, 8u, 32u, 21u, 6u, 18u, 24u, 9u, 33u, 36u, 3u, 12u, 48u, 22u, 25u, 37u, 40u, 34u, 10u, 7u, 19u, 28u, 13u, 49u, 52u, 41u, 38u, 26u, 23u, 29u, 53u, 11u, 35u, 44u, 14u, 50u, 56u, 42u, 27u, 39u, 45u, 30u, 54u, 57u, 60u, 51u, 15u, 43u, 46u, 58u, 61u, 55u, 31u, 62u, 59u, 47u, 63u);
      let x_825 = indexable[x_822];
      param_27 = uint_block[i_4];
      let x_830 = uint2int_u1_(&(param_27));
      int_block[x_825] = x_830;

      continuing {
        i_4 = (i_4 + bitcast<u32>(1i));
      }
    }
    param_28 = int_block;
    inverse_transform_i1_64__(&(param_28));
    int_block = param_28;
    inv_w = ldexp(1.0f, (emax - 30i));
    i_5 = 0u;
    loop {
      if ((i_5 < 64u)) {
      } else {
        break;
      }
      let x_853 = i_5;
      (*(decompressed_block))[x_853] = (inv_w * f32(int_block[i_5]));

      continuing {
        i_5 = (i_5 + bitcast<u32>(1i));
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
  if (((x_865.start_block_offset + gl_GlobalInvocationID.x) >= x_865.total_n_blocks)) {
    return;
  }
  block_index_1 = x_885.block_ids[(x_865.start_block_offset + gl_GlobalInvocationID.x)];
  cache_location = x_897.cached_item_slots[block_index_1];
  param_29 = block_index_1;
  let x_904 = create_block_reader_u1_(&(param_29));
  reader_6 = x_904;
  param_30 = reader_6;
  param_31 = decompressed_block_1;
  decompress_block_struct_BlockReader_u1_u1_struct_EmulateUint64_u1_u111_f1_64__(&(param_30), &(param_31));
  decompressed_block_1 = param_31;
  i_6 = 0u;
  loop {
    if ((i_6 < 64u)) {
    } else {
      break;
    }
    let x_924 = cache_location;
    let x_926 = i_6;
    x_923.decompressed[((x_924 * 64u) + x_926)] = decompressed_block_1[i_6];

    continuing {
      i_6 = (i_6 + bitcast<u32>(1i));
    }
  }
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_cache_init_comp_spv = `struct Slot {
  /* @offset(0) */
  age : u32,
  /* @offset(4) */
  available : u32,
  /* @offset(8) */
  item_id : i32,
}

alias RTArr = array<Slot>;

struct SlotData {
  /* @offset(0) */
  slot_data : RTArr,
}

struct OldSize {
  /* @offset(0) */
  old_size : u32,
}

alias RTArr_1 = array<i32>;

struct CachedItemSlots {
  /* @offset(0) */
  cached_item_slot : RTArr_1,
}

alias RTArr_2 = array<u32>;

struct SlotAvailableIDs {
  /* @offset(0) */
  slot_available_id : RTArr_2,
}

@group(0) @binding(2) var<storage, read_write> x_12 : SlotData;

@group(1) @binding(0) var<uniform> x_16 : OldSize;

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(0) var<storage, read_write> x_50 : CachedItemSlots;

@group(0) @binding(1) var<storage, read_write> x_54 : SlotAvailableIDs;

fn main_1() {
  let x_19 = x_16.old_size;
  let x_26 = gl_GlobalInvocationID.x;
  x_12.slot_data[(x_19 + x_26)].age = 100000u;
  let x_31 = x_16.old_size;
  let x_33 = gl_GlobalInvocationID.x;
  x_12.slot_data[(x_31 + x_33)].available = 1u;
  let x_39 = x_16.old_size;
  let x_41 = gl_GlobalInvocationID.x;
  x_12.slot_data[(x_39 + x_41)].item_id = -1i;
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_cache_mark_new_items_comp_spv = `struct PushConstants {
  /* @offset(0) */
  global_idx_offset : u32,
  /* @offset(4) */
  num_work_items : u32,
}

alias RTArr = array<i32>;

struct CachedItemSlots {
  /* @offset(0) */
  cached_item_slot : RTArr,
}

alias RTArr_1 = array<u32>;

struct ItemNeedsCaching {
  /* @offset(0) */
  item_needs_caching : RTArr_1,
}

alias RTArr_2 = array<u32>;

struct ItemNeeded {
  /* @offset(0) */
  item_needed : RTArr_2,
}

struct Slot {
  /* @offset(0) */
  age : u32,
  /* @offset(4) */
  available : u32,
  /* @offset(8) */
  item_id : i32,
}

alias RTArr_3 = array<Slot>;

struct SlotData {
  /* @offset(0) */
  slot_data : RTArr_3,
}

alias RTArr_4 = array<u32>;

struct SlotAvailableIDs {
  /* @offset(0) */
  slot_available_id : RTArr_4,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(2) @binding(0) var<uniform> x_18 : PushConstants;

@group(0) @binding(0) var<storage, read_write> x_32 : CachedItemSlots;

@group(1) @binding(1) var<storage, read_write> x_45 : ItemNeedsCaching;

@group(1) @binding(0) var<storage, read> x_51 : ItemNeeded;

@group(0) @binding(2) var<storage, read_write> x_63 : SlotData;

@group(0) @binding(1) var<storage, read_write> x_81 : SlotAvailableIDs;

fn main_1() {
  var idx : u32;
  var slot : i32;
  idx = (gl_GlobalInvocationID.x + (x_18.global_idx_offset * 32u));
  slot = x_32.cached_item_slot[idx];
  if ((slot >= 0i)) {
    let x_46 = idx;
    x_45.item_needs_caching[x_46] = 0u;
    if ((x_51.item_needed[idx] == 1u)) {
      let x_64 = slot;
      x_63.slot_data[x_64].age = 0u;
      let x_66 = slot;
      x_63.slot_data[x_66].available = 0u;
    } else {
      let x_70 = slot;
      x_63.slot_data[x_70].available = 1u;
    }
  } else {
    let x_73 = idx;
    x_45.item_needs_caching[x_73] = x_51.item_needed[idx];
  }
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_cache_update_comp_spv = `struct NumNewItemIDs {
  /* @offset(0) */
  num_new_items : u32,
}

alias RTArr = array<u32>;

struct NewItemIDs {
  /* @offset(0) */
  new_items : RTArr,
}

alias RTArr_1 = array<u32>;

struct SlotAvailableIDs {
  /* @offset(0) */
  slot_available_id : RTArr_1,
}

struct Slot {
  /* @offset(0) */
  age : u32,
  /* @offset(4) */
  available : u32,
  /* @offset(8) */
  item_id : i32,
}

alias RTArr_2 = array<Slot>;

struct SlotData {
  /* @offset(0) */
  slot_data : RTArr_2,
}

alias RTArr_3 = array<i32>;

struct CachedItemSlots {
  /* @offset(0) */
  cached_item_slot : RTArr_3,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(2) @binding(0) var<uniform> x_16 : NumNewItemIDs;

@group(1) @binding(0) var<storage, read_write> x_32 : NewItemIDs;

@group(0) @binding(1) var<storage, read_write> x_41 : SlotAvailableIDs;

@group(0) @binding(2) var<storage, read_write> x_52 : SlotData;

@group(0) @binding(0) var<storage, read_write> x_66 : CachedItemSlots;

fn main_1() {
  var item : u32;
  var slot : u32;
  var prev : i32;
  if ((gl_GlobalInvocationID.x >= x_16.num_new_items)) {
    return;
  }
  item = x_32.new_items[gl_GlobalInvocationID.x];
  slot = x_41.slot_available_id[gl_GlobalInvocationID.x];
  prev = x_52.slot_data[slot].item_id;
  if ((prev != -1i)) {
    let x_67 = prev;
    x_66.cached_item_slot[x_67] = -1i;
  }
  let x_69 = slot;
  x_52.slot_data[x_69].age = 0u;
  let x_71 = slot;
  x_52.slot_data[x_71].item_id = bitcast<i32>(item);
  let x_75 = slot;
  x_52.slot_data[x_75].available = 0u;
  let x_78 = item;
  x_66.cached_item_slot[x_78] = bitcast<i32>(slot);
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_copy_available_slot_age_comp_spv = `struct NumNewItemIDs {
  /* @offset(0) */
  num_slots_available : u32,
}

alias RTArr = array<u32>;

struct AvailableSlotAges {
  /* @offset(0) */
  available_slot_ages : RTArr,
}

struct Slot {
  /* @offset(0) */
  age : u32,
  /* @offset(4) */
  available : u32,
  /* @offset(8) */
  item_id : i32,
}

alias RTArr_1 = array<Slot>;

struct SlotData {
  /* @offset(0) */
  slot_data : RTArr_1,
}

alias RTArr_2 = array<u32>;

struct SlotAvailableIDs {
  /* @offset(0) */
  slot_available_id : RTArr_2,
}

alias RTArr_3 = array<i32>;

struct CachedItemSlots {
  /* @offset(0) */
  cached_item_slot : RTArr_3,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(2) @binding(0) var<uniform> x_16 : NumNewItemIDs;

@group(1) @binding(0) var<storage, read_write> x_30 : AvailableSlotAges;

@group(0) @binding(2) var<storage, read_write> x_37 : SlotData;

@group(0) @binding(1) var<storage, read_write> x_41 : SlotAvailableIDs;

@group(0) @binding(0) var<storage, read_write> x_52 : CachedItemSlots;

fn main_1() {
  if ((gl_GlobalInvocationID.x >= x_16.num_slots_available)) {
    return;
  }
  let x_32 = gl_GlobalInvocationID.x;
  x_30.available_slot_ages[x_32] = x_37.slot_data[x_41.slot_available_id[gl_GlobalInvocationID.x]].age;
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_cache_age_slots_comp_spv = `struct Slot {
  /* @offset(0) */
  age : u32,
  /* @offset(4) */
  available : u32,
  /* @offset(8) */
  item_id : i32,
}

alias RTArr = array<Slot>;

struct SlotData {
  /* @offset(0) */
  slot_data : RTArr,
}

alias RTArr_1 = array<i32>;

struct CachedItemSlots {
  /* @offset(0) */
  cached_item_slot : RTArr_1,
}

alias RTArr_2 = array<u32>;

struct SlotAvailableIDs {
  /* @offset(0) */
  slot_available_id : RTArr_2,
}

@group(0) @binding(2) var<storage, read_write> x_12 : SlotData;

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(0) var<storage, read_write> x_30 : CachedItemSlots;

@group(0) @binding(1) var<storage, read_write> x_34 : SlotAvailableIDs;

fn main_1() {
  let x_20 = gl_GlobalInvocationID.x;
  x_12.slot_data[x_20].age = (x_12.slot_data[x_20].age + 1u);
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const lru_cache_extract_slot_available_comp_spv = `alias RTArr = array<u32>;

struct Output {
  /* @offset(0) */
  out_buf : RTArr,
}

struct Slot {
  /* @offset(0) */
  age : u32,
  /* @offset(4) */
  available : u32,
  /* @offset(8) */
  item_id : i32,
}

alias RTArr_1 = array<Slot>;

struct SlotData {
  /* @offset(0) */
  slot_data : RTArr_1,
}

alias RTArr_2 = array<i32>;

struct CachedItemSlots {
  /* @offset(0) */
  cached_item_slot : RTArr_2,
}

alias RTArr_3 = array<u32>;

struct SlotAvailableIDs {
  /* @offset(0) */
  slot_available_id : RTArr_3,
}

@group(1) @binding(0) var<storage, read_write> x_10 : Output;

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(2) var<storage, read_write> x_24 : SlotData;

@group(0) @binding(0) var<storage, read_write> x_35 : CachedItemSlots;

@group(0) @binding(1) var<storage, read_write> x_39 : SlotAvailableIDs;

fn main_1() {
  let x_19 = gl_GlobalInvocationID.x;
  x_10.out_buf[x_19] = x_24.slot_data[gl_GlobalInvocationID.x].available;
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const macro_traverse_comp_spv = `struct GridIterator {
  grid_dims : vec3i,
  grid_step : vec3i,
  t_delta : vec3f,
  cell : vec3i,
  t_max : vec3f,
  t : f32,
}

struct GridIteratorState {
  t_max : vec3f,
  cell_id : i32,
}

struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

struct RayInfo {
  /* @offset(0) */
  ray_dir : vec3f,
  /* @offset(12) */
  t : f32,
}

alias RTArr = array<RayInfo>;

struct RayInformation {
  /* @offset(0) */
  rays : RTArr,
}

struct ViewParams {
  /* @offset(0) */
  proj_view : mat4x4f,
  /* @offset(64) */
  eye_pos : vec4f,
  /* @offset(80) */
  eye_dir : vec4f,
  /* @offset(96) */
  near_plane : f32,
  /* @offset(100) */
  current_pass_index : u32,
  /* @offset(104) */
  speculation_count : u32,
}

alias RTArr_1 = array<u32>;

struct RayIDs {
  /* @offset(0) */
  ray_ids : RTArr_1,
}

alias RTArr_2 = array<u32>;

struct RayOffsets {
  /* @offset(0) */
  ray_offsets : RTArr_2,
}

struct GridIteratorState_1 {
  /* @offset(0) */
  t_max : vec3f,
  /* @offset(12) */
  cell_id : i32,
}

alias RTArr_3 = array<GridIteratorState_1>;

struct GridIterState {
  /* @offset(0) */
  iterator_state : RTArr_3,
}

alias RTArr_4 = array<vec2f>;

struct CoarseCellRange {
  /* @offset(0) */
  coarse_cell_ranges : RTArr_4,
}

alias RTArr_5 = array<vec2f>;

struct VoxelInformation {
  /* @offset(0) */
  voxel_ranges : RTArr_5,
}

alias RTArr_6 = array<u32>;

struct RayBlockIDs {
  /* @offset(0) */
  block_ids : RTArr_6,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(0) var<uniform> x_312 : VolumeParams;

@group(0) @binding(2) var<storage, read_write> x_334 : RayInformation;

@group(0) @binding(1) var<uniform> x_347 : ViewParams;

@group(0) @binding(5) var<storage, read_write> x_367 : RayIDs;

@group(0) @binding(6) var<storage, read_write> x_371 : RayOffsets;

@group(0) @binding(4) var<storage, read_write> x_479 : GridIterState;

@group(1) @binding(1) var<storage, read_write> x_533 : CoarseCellRange;

@group(1) @binding(0) var<storage, read_write> x_667 : VoxelInformation;

@group(0) @binding(7) var<storage, read_write> x_689 : RayBlockIDs;

@group(0) @binding(3) var render_target : texture_storage_2d<rgba8unorm, write>;

fn init_grid_iterator_vf3_vf3_f1_vi3_(ray_org : ptr<function, vec3f>, ray_dir : ptr<function, vec3f>, t : ptr<function, f32>, grid_dims_1 : ptr<function, vec3i>) -> GridIterator {
  var grid_iter : GridIterator;
  var inv_ray_dir : vec3f;
  var p_1 : vec3f;
  var cell : vec3f;
  var t_max_neg : vec3f;
  var t_max_pos : vec3f;
  var is_neg_dir : vec3<bool>;
  grid_iter.grid_dims = *(grid_dims_1);
  grid_iter.grid_step = vec3i(sign(*(ray_dir)));
  inv_ray_dir = (vec3f(1.0f) / *(ray_dir));
  grid_iter.t_delta = abs(inv_ray_dir);
  p_1 = (*(ray_org) + (*(ray_dir) * *(t)));
  p_1 = clamp(p_1, vec3f(), vec3f((*(grid_dims_1) - vec3i(1i))));
  cell = floor(p_1);
  t_max_neg = ((cell - *(ray_org)) * inv_ray_dir);
  t_max_pos = (((cell + vec3f(1.0f)) - *(ray_org)) * inv_ray_dir);
  is_neg_dir = (*(ray_dir) < vec3f());
  grid_iter.t_max = select(t_max_pos, t_max_neg, is_neg_dir);
  grid_iter.cell = vec3i(cell);
  grid_iter.t = *(t);
  let x_131 = grid_iter;
  return x_131;
}

fn restore_grid_iterator_vf3_vf3_vi3_struct_GridIteratorState_vf3_i11_(ray_org_1 : ptr<function, vec3f>, ray_dir_1 : ptr<function, vec3f>, grid_dims_2 : ptr<function, vec3i>, state : ptr<function, GridIteratorState>) -> GridIterator {
  var grid_iter_1 : GridIterator;
  var inv_ray_dir_1 : vec3f;
  grid_iter_1.grid_dims = *(grid_dims_2);
  grid_iter_1.grid_step = vec3i(sign(*(ray_dir_1)));
  inv_ray_dir_1 = (vec3f(1.0f) / *(ray_dir_1));
  grid_iter_1.t_delta = abs(inv_ray_dir_1);
  grid_iter_1.cell = vec3i(((*(state)).cell_id % (*(grid_dims_2)).x), (((*(state)).cell_id / (*(grid_dims_2)).x) % (*(grid_dims_2)).y), ((*(state)).cell_id / ((*(grid_dims_2)).x * (*(grid_dims_2)).y)));
  grid_iter_1.t_max = (*(state)).t_max;
  grid_iter_1.t = min((*(state)).t_max.x, min((*(state)).t_max.y, (*(state)).t_max.z));
  let x_188 = grid_iter_1;
  return x_188;
}

fn outside_grid_vi3_vi3_(p : vec3i, grid_dims : vec3i) -> bool {
  var x_62 : bool;
  var x_63 : bool;
  let x_57 = any((p < vec3i()));
  x_63 = x_57;
  if (!(x_57)) {
    x_62 = any((p >= grid_dims));
    x_63 = x_62;
  }
  return x_63;
}

fn grid_iterator_get_cell_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_vf2_vi3_(iter : ptr<function, GridIterator>, cell_t_range : ptr<function, vec2f>, cell_id : ptr<function, vec3i>) -> bool {
  let x_192 = (*(iter)).cell;
  let x_194 = (*(iter)).grid_dims;
  let x_195 = outside_grid_vi3_vi3_(x_192, x_194);
  if (x_195) {
    return false;
  }
  (*(cell_t_range)).x = (*(iter)).t;
  (*(cell_t_range)).y = min((*(iter)).t_max.x, min((*(iter)).t_max.y, (*(iter)).t_max.z));
  *(cell_id) = (*(iter)).cell;
  if (((*(cell_t_range)).y < (*(cell_t_range)).x)) {
    return false;
  }
  return true;
}

fn grid_iterator_advance_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_(iter_2 : ptr<function, GridIterator>) {
  (*(iter_2)).t = min((*(iter_2)).t_max.x, min((*(iter_2)).t_max.y, (*(iter_2)).t_max.z));
  if (((*(iter_2)).t == (*(iter_2)).t_max.x)) {
    (*(iter_2)).cell.x = ((*(iter_2)).cell.x + (*(iter_2)).grid_step.x);
    (*(iter_2)).t_max.x = ((*(iter_2)).t_max.x + (*(iter_2)).t_delta.x);
  } else {
    if (((*(iter_2)).t == (*(iter_2)).t_max.y)) {
      (*(iter_2)).cell.y = ((*(iter_2)).cell.y + (*(iter_2)).grid_step.y);
      (*(iter_2)).t_max.y = ((*(iter_2)).t_max.y + (*(iter_2)).t_delta.y);
    } else {
      (*(iter_2)).cell.z = ((*(iter_2)).cell.z + (*(iter_2)).grid_step.z);
      (*(iter_2)).t_max.z = ((*(iter_2)).t_max.z + (*(iter_2)).t_delta.z);
    }
  }
  return;
}

fn grid_iterator_get_cell_id_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_(iter_1 : ptr<function, GridIterator>) -> i32 {
  let x_226 = (*(iter_1)).cell.x;
  let x_228 = (*(iter_1)).grid_dims.x;
  let x_230 = (*(iter_1)).cell.y;
  let x_232 = (*(iter_1)).grid_dims.y;
  let x_234 = (*(iter_1)).cell.z;
  return (x_226 + (x_228 * (x_230 + (x_232 * x_234))));
}

const x_408 = vec3f(4.0f);

fn main_1() {
  var ray_index : u32;
  var i : i32;
  var n_blocks : vec3u;
  var macrogrid_dims : vec3i;
  var coarse_grid_dims : vec3i;
  var volume_translation : vec3f;
  var transformed_eye : vec3f;
  var ray_org_2 : vec3f;
  var macrocell_grid_org : vec3f;
  var macrocell_grid_ray_dir : vec3f;
  var coarse_grid_org : vec3f;
  var coarse_grid_ray_dir : vec3f;
  var first_coarse_iter : bool;
  var coarse_grid_iter : GridIterator;
  var param : vec3f;
  var param_1 : vec3f;
  var param_2 : f32;
  var param_3 : vec3i;
  var param_4 : vec3f;
  var param_5 : vec3f;
  var param_6 : vec3i;
  var param_7 : GridIteratorState;
  var speculated : u32;
  var coarse_cell_t_range : vec2f;
  var coarse_cell_id : vec3i;
  var param_8 : GridIterator;
  var param_9 : vec2f;
  var param_10 : vec3i;
  var coarse_cell_index : u32;
  var coarse_cell_range : vec2f;
  var param_11 : GridIterator;
  var coarse_grid_cell_org : vec3i;
  var macrocell_grid_dims : vec3i;
  var grid_iter_2 : GridIterator;
  var param_12 : vec3f;
  var param_13 : vec3f;
  var param_14 : f32;
  var param_15 : vec3i;
  var param_16 : vec3f;
  var param_17 : vec3f;
  var param_18 : vec3i;
  var param_19 : GridIteratorState;
  var param_20 : GridIterator;
  var cell_t_range_1 : vec2f;
  var cell_id_1 : vec3i;
  var param_21 : GridIterator;
  var param_22 : vec2f;
  var param_23 : vec3i;
  var block_index : u32;
  var cell_range : vec2f;
  var param_24 : GridIterator;
  var param_25 : GridIterator;
  var param_26 : GridIterator;
  var param_27 : GridIterator;
  if ((gl_GlobalInvocationID.x >= x_312.image_width)) {
    return;
  }
  ray_index = (gl_GlobalInvocationID.x + (gl_GlobalInvocationID.y * x_312.image_width));
  if ((x_334.rays[ray_index].t == 340282346638528859811704183484516925440.0f)) {
    return;
  }
  if ((x_347.speculation_count > 1u)) {
    i = 0i;
    loop {
      if ((bitcast<u32>(i) < x_347.speculation_count)) {
      } else {
        break;
      }
      let x_374 = x_371.ray_offsets[ray_index];
      let x_376 = x_347.speculation_count;
      let x_378 = i;
      x_367.ray_ids[((x_374 * x_376) + bitcast<u32>(x_378))] = ray_index;

      continuing {
        i = (i + 1i);
      }
    }
  } else {
    let x_386 = ray_index;
    x_367.ray_ids[x_386] = ray_index;
    let x_389 = ray_index;
    x_371.ray_offsets[x_389] = ray_index;
  }
  n_blocks = (x_312.padded_dims.xyz / vec3u(4u));
  macrogrid_dims = bitcast<vec3i>(n_blocks);
  coarse_grid_dims = vec3i(ceil((vec3f(macrogrid_dims) / x_408)));
  volume_translation = (vec3f() - (x_312.volume_scale.xyz * 0.5f));
  transformed_eye = ((x_347.eye_pos.xyz - volume_translation) / x_312.volume_scale.xyz);
  ray_org_2 = ((transformed_eye * vec3f(x_312.volume_dims.xyz)) - vec3f(0.5f));
  macrocell_grid_org = (ray_org_2 * 0.25f);
  macrocell_grid_ray_dir = (x_334.rays[ray_index].ray_dir * 0.25f);
  coarse_grid_org = (macrocell_grid_org * 0.25f);
  coarse_grid_ray_dir = (macrocell_grid_ray_dir * 0.25f);
  first_coarse_iter = true;
  if ((x_347.current_pass_index == 0u)) {
    let x_463 = ray_index;
    param = coarse_grid_org;
    param_1 = coarse_grid_ray_dir;
    param_2 = x_334.rays[x_463].t;
    param_3 = coarse_grid_dims;
    let x_473 = init_grid_iterator_vf3_vf3_f1_vi3_(&(param), &(param_1), &(param_2), &(param_3));
    coarse_grid_iter = x_473;
  } else {
    let x_480 = ray_index;
    param_4 = coarse_grid_org;
    param_5 = coarse_grid_ray_dir;
    param_6 = coarse_grid_dims;
    let x_491 = x_479.iterator_state[(x_480 * 2u)];
    param_7.t_max = x_491.t_max;
    param_7.cell_id = x_491.cell_id;
    let x_496 = restore_grid_iterator_vf3_vf3_vi3_struct_GridIteratorState_vf3_i11_(&(param_4), &(param_5), &(param_6), &(param_7));
    coarse_grid_iter = x_496;
  }
  speculated = 0u;
  loop {
    var x_550 : bool;
    var x_551 : bool;
    param_8 = coarse_grid_iter;
    let x_509 = grid_iterator_get_cell_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_vf2_vi3_(&(param_8), &(param_9), &(param_10));
    coarse_grid_iter = param_8;
    coarse_cell_t_range = param_9;
    coarse_cell_id = param_10;
    if (x_509) {
    } else {
      break;
    }
    coarse_cell_index = bitcast<u32>((coarse_cell_id.x + (coarse_grid_dims.x * (coarse_cell_id.y + (coarse_grid_dims.y * coarse_cell_id.z)))));
    coarse_cell_range = x_533.coarse_cell_ranges[coarse_cell_index];
    let x_542 = (x_312.isovalue < coarse_cell_range.x);
    x_551 = x_542;
    if (!(x_542)) {
      x_550 = (x_312.isovalue > coarse_cell_range.y);
      x_551 = x_550;
    }
    if (x_551) {
      first_coarse_iter = false;
      param_11 = coarse_grid_iter;
      grid_iterator_advance_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_(&(param_11));
      coarse_grid_iter = param_11;
      continue;
    }
    coarse_grid_cell_org = (coarse_cell_id * vec3i(4i));
    macrocell_grid_dims = vec3i((min((vec3f(coarse_grid_cell_org) + x_408), vec3f(macrogrid_dims)) - vec3f(coarse_grid_cell_org)));
    if (((x_347.current_pass_index == 0u) | !(first_coarse_iter))) {
      param_12 = (macrocell_grid_org - vec3f(coarse_grid_cell_org));
      param_13 = macrocell_grid_ray_dir;
      param_14 = coarse_cell_t_range.x;
      param_15 = macrocell_grid_dims;
      let x_595 = init_grid_iterator_vf3_vf3_f1_vi3_(&(param_12), &(param_13), &(param_14), &(param_15));
      grid_iter_2 = x_595;
    } else {
      let x_601 = ray_index;
      param_16 = (macrocell_grid_org - vec3f(coarse_grid_cell_org));
      param_17 = macrocell_grid_ray_dir;
      param_18 = macrocell_grid_dims;
      let x_611 = x_479.iterator_state[((x_601 * 2u) + 1u)];
      param_19.t_max = x_611.t_max;
      param_19.cell_id = x_611.cell_id;
      let x_616 = restore_grid_iterator_vf3_vf3_vi3_struct_GridIteratorState_vf3_i11_(&(param_16), &(param_17), &(param_18), &(param_19));
      grid_iter_2 = x_616;
      param_20 = grid_iter_2;
      grid_iterator_advance_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_(&(param_20));
      grid_iter_2 = param_20;
    }
    loop {
      var x_682 : bool;
      var x_683 : bool;
      param_21 = grid_iter_2;
      let x_632 = grid_iterator_get_cell_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_vf2_vi3_(&(param_21), &(param_22), &(param_23));
      grid_iter_2 = param_21;
      cell_t_range_1 = param_22;
      cell_id_1 = param_23;
      if (x_632) {
      } else {
        break;
      }
      block_index = (bitcast<u32>((coarse_grid_cell_org.x + cell_id_1.x)) + (n_blocks.x * (bitcast<u32>((coarse_grid_cell_org.y + cell_id_1.y)) + (n_blocks.y * bitcast<u32>((coarse_grid_cell_org.z + cell_id_1.z))))));
      cell_range = x_667.voxel_ranges[block_index];
      let x_675 = (x_312.isovalue >= cell_range.x);
      x_683 = x_675;
      if (x_675) {
        x_682 = (x_312.isovalue <= cell_range.y);
        x_683 = x_682;
      }
      if (x_683) {
        let x_692 = x_371.ray_offsets[ray_index];
        let x_694 = x_347.speculation_count;
        let x_696 = speculated;
        x_689.block_ids[((x_692 * x_694) + x_696)] = block_index;
        speculated = (speculated + bitcast<u32>(1i));
        if ((speculated == x_347.speculation_count)) {
          let x_708 = ray_index;
          param_24 = coarse_grid_iter;
          let x_712 = grid_iterator_get_cell_id_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_(&(param_24));
          x_479.iterator_state[(x_708 * 2u)].cell_id = x_712;
          let x_715 = ray_index;
          x_479.iterator_state[(x_715 * 2u)].t_max = coarse_grid_iter.t_max;
          let x_720 = ray_index;
          param_25 = grid_iter_2;
          let x_725 = grid_iterator_get_cell_id_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_(&(param_25));
          x_479.iterator_state[((x_720 * 2u) + 1u)].cell_id = x_725;
          let x_727 = ray_index;
          x_479.iterator_state[((x_727 * 2u) + 1u)].t_max = grid_iter_2.t_max;
          return;
        }
      }
      param_26 = grid_iter_2;
      grid_iterator_advance_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_(&(param_26));
      grid_iter_2 = param_26;
    }
    first_coarse_iter = false;
    param_27 = coarse_grid_iter;
    grid_iterator_advance_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_(&(param_27));
    coarse_grid_iter = param_27;
  }
  if ((speculated == 0u)) {
    let x_746 = ray_index;
    x_334.rays[x_746].t = 340282346638528859811704183484516925440.0f;
  } else {
    if ((speculated < x_347.speculation_count)) {
      let x_755 = ray_index;
      x_334.rays[x_755].t = -340282346638528859811704183484516925440.0f;
    }
  }
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const radix_sort_chunk_comp_spv = `struct BufferInfo {
  /* @offset(0) */
  size : u32,
}

alias RTArr = array<u32>;

struct Keys {
  /* @offset(0) */
  keys : RTArr,
}

alias RTArr_1 = array<u32>;

struct Values {
  /* @offset(0) */
  values : RTArr_1,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(0) var<uniform> x_16 : BufferInfo;

var<workgroup> key_buf : array<u32, 64u>;

var<private> gl_LocalInvocationID : vec3u;

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
  if ((gl_GlobalInvocationID.x < x_16.size)) {
    let x_32 = gl_LocalInvocationID.x;
    key_buf[x_32] = x_36.keys[gl_GlobalInvocationID.x];
    let x_45 = gl_LocalInvocationID.x;
    val_buf[x_45] = x_49.values[gl_GlobalInvocationID.x];
  } else {
    let x_57 = gl_LocalInvocationID.x;
    key_buf[x_57] = 4294967295u;
    let x_61 = gl_LocalInvocationID.x;
    val_buf[x_61] = 4294967295u;
  }
  i = 0u;
  loop {
    if ((i < 32u)) {
    } else {
      break;
    }
    workgroupBarrier();
    mask = bitcast<u32>((1i << i));
    let x_82 = gl_LocalInvocationID.x;
    scratch[x_82] = bitcast<u32>(select(1i, 0i, ((key_buf[gl_LocalInvocationID.x] & mask) != 0u)));
    offs = 1u;
    d = 32i;
    loop {
      if ((d > 0i)) {
      } else {
        break;
      }
      workgroupBarrier();
      if ((gl_LocalInvocationID.x < bitcast<u32>(d))) {
        a = ((offs * ((2u * gl_LocalInvocationID.x) + 1u)) - 1u);
        b = ((offs * ((2u * gl_LocalInvocationID.x) + 2u)) - 1u);
        let x_128 = b;
        scratch[x_128] = (scratch[b] + scratch[a]);
      }
      offs = (offs << bitcast<u32>(1i));

      continuing {
        d = (d >> bitcast<u32>(1i));
      }
    }
    if ((gl_LocalInvocationID.x == 0u)) {
      total_false = scratch[63i];
      scratch[63i] = 0u;
    }
    d_1 = 1i;
    loop {
      if ((d_1 < 64i)) {
      } else {
        break;
      }
      offs = (offs >> bitcast<u32>(1i));
      workgroupBarrier();
      if ((gl_LocalInvocationID.x < bitcast<u32>(d_1))) {
        a_1 = ((offs * ((2u * gl_LocalInvocationID.x) + 1u)) - 1u);
        b_1 = ((offs * ((2u * gl_LocalInvocationID.x) + 2u)) - 1u);
        tmp = scratch[a_1];
        let x_188 = a_1;
        scratch[x_188] = scratch[b_1];
        let x_193 = b_1;
        scratch[x_193] = (scratch[b_1] + tmp);
      }

      continuing {
        d_1 = (d_1 << bitcast<u32>(1i));
      }
    }
    workgroupBarrier();
    f = scratch[gl_LocalInvocationID.x];
    t = ((gl_LocalInvocationID.x - f) + total_false);
    if (((key_buf[gl_LocalInvocationID.x] & mask) != 0u)) {
      let x_223 = t;
      sorted_key_buf[x_223] = key_buf[gl_LocalInvocationID.x];
      let x_230 = t;
      sorted_val_buf[x_230] = val_buf[gl_LocalInvocationID.x];
    } else {
      let x_237 = f;
      sorted_key_buf[x_237] = key_buf[gl_LocalInvocationID.x];
      let x_243 = f;
      sorted_val_buf[x_243] = val_buf[gl_LocalInvocationID.x];
    }
    workgroupBarrier();
    let x_250 = gl_LocalInvocationID.x;
    key_buf[x_250] = sorted_key_buf[gl_LocalInvocationID.x];
    let x_257 = gl_LocalInvocationID.x;
    val_buf[x_257] = sorted_val_buf[gl_LocalInvocationID.x];

    continuing {
      i = (i + bitcast<u32>(1i));
    }
  }
  workgroupBarrier();
  let x_266 = gl_GlobalInvocationID.x;
  x_36.keys[x_266] = key_buf[gl_LocalInvocationID.x];
  let x_273 = gl_GlobalInvocationID.x;
  x_49.values[x_273] = val_buf[gl_LocalInvocationID.x];
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u, @builtin(local_invocation_id) gl_LocalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  main_1();
}
`;

const reverse_buffer_comp_spv = `struct BufferInfo {
  /* @offset(0) */
  size : u32,
}

alias RTArr = array<u32>;

struct Values {
  /* @offset(0) */
  values : RTArr,
}

@group(0) @binding(0) var<uniform> x_48 : BufferInfo;

var<private> gl_GlobalInvocationID : vec3u;

@group(1) @binding(0) var<storage, read_write> x_94 : Values;

fn next_pow2_u1_(x : ptr<function, u32>) -> u32 {
  *(x) = (*(x) - 1u);
  *(x) = (*(x) | (*(x) >> bitcast<u32>(1i)));
  *(x) = (*(x) | (*(x) >> bitcast<u32>(2i)));
  *(x) = (*(x) | (*(x) >> bitcast<u32>(4i)));
  *(x) = (*(x) | (*(x) >> bitcast<u32>(8i)));
  *(x) = (*(x) | (*(x) >> bitcast<u32>(16i)));
  let x_41 = *(x);
  return (x_41 + 1u);
}

fn main_1() {
  var aligned_size : u32;
  var param : u32;
  var i : u32;
  var j : u32;
  var tmp : u32;
  var x_76 : bool;
  var x_77 : bool;
  param = u32(ceil((f32(x_48.size) / 64.0f)));
  let x_60 = next_pow2_u1_(&(param));
  aligned_size = (x_60 * 64u);
  let x_65 = (aligned_size < 64u);
  x_77 = x_65;
  if (x_65) {
    x_76 = (gl_GlobalInvocationID.x > 32u);
    x_77 = x_76;
  }
  if (x_77) {
    return;
  }
  i = gl_GlobalInvocationID.x;
  j = ((aligned_size - gl_GlobalInvocationID.x) - 1u);
  tmp = x_94.values[i];
  let x_98 = i;
  x_94.values[x_98] = x_94.values[j];
  let x_103 = j;
  x_94.values[x_103] = tmp;
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const merge_sorted_chunks_comp_spv = `alias RTArr = array<u32>;

struct InputKeys {
  /* @offset(0) */
  input_keys : RTArr,
}

struct BufferInfo {
  /* @offset(0) */
  size : u32,
}

struct NumWorkGroups {
  /* @offset(0) */
  work_groups_x : u32,
}

alias RTArr_1 = array<u32>;

struct OutputKeys {
  /* @offset(0) */
  output_keys : RTArr_1,
}

alias RTArr_2 = array<u32>;

struct OutputValues {
  /* @offset(0) */
  output_values : RTArr_2,
}

alias RTArr_3 = array<u32>;

struct InputValues {
  /* @offset(0) */
  input_values : RTArr_3,
}

@group(1) @binding(0) var<storage, read_write> x_75 : InputKeys;

@group(0) @binding(0) var<uniform> x_132 : BufferInfo;

@group(2) @binding(0) var<uniform> x_149 : NumWorkGroups;

var<private> gl_LocalInvocationID : vec3u;

@group(1) @binding(2) var<storage, read_write> x_231 : OutputKeys;

@group(1) @binding(3) var<storage, read_write> x_240 : OutputValues;

@group(1) @binding(1) var<storage, read_write> x_245 : InputValues;

fn next_pow2_u1_(x : ptr<function, u32>) -> u32 {
  *(x) = (*(x) - 1u);
  *(x) = (*(x) | (*(x) >> bitcast<u32>(1i)));
  *(x) = (*(x) | (*(x) >> bitcast<u32>(2i)));
  *(x) = (*(x) | (*(x) >> bitcast<u32>(4i)));
  *(x) = (*(x) | (*(x) >> bitcast<u32>(8i)));
  *(x) = (*(x) | (*(x) >> bitcast<u32>(16i)));
  let x_52 = *(x);
  return (x_52 + 1u);
}

fn upper_bound_u1_u1_u1_(start : ptr<function, u32>, count : ptr<function, u32>, element : ptr<function, u32>) -> u32 {
  var i : u32;
  loop {
    if ((*(count) > 0u)) {
    } else {
      break;
    }
    i = (*(start) + (*(count) / 2u));
    if ((*(element) >= x_75.input_keys[i])) {
      *(start) = (i + 1u);
      *(count) = (*(count) - ((*(count) / 2u) + 1u));
    } else {
      *(count) = (*(count) / 2u);
    }
  }
  let x_94 = *(start);
  return x_94;
}

fn lower_bound_u1_u1_u1_(start_1 : ptr<function, u32>, count_1 : ptr<function, u32>, element_1 : ptr<function, u32>) -> u32 {
  var i_1 : u32;
  loop {
    if ((*(count_1) > 0u)) {
    } else {
      break;
    }
    i_1 = (*(start_1) + (*(count_1) / 2u));
    if ((x_75.input_keys[i_1] < *(element_1))) {
      *(start_1) = (i_1 + 1u);
      *(count_1) = (*(count_1) - ((*(count_1) / 2u) + 1u));
    } else {
      *(count_1) = (*(count_1) / 2u);
    }
  }
  let x_126 = *(start_1);
  return x_126;
}

fn main_1(tint_wgid : vec3u) {
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
  param = u32(ceil((f32(x_132.size) / 64.0f)));
  let x_142 = next_pow2_u1_(&(param));
  aligned_size = (x_142 * 64u);
  merge_output_size = (aligned_size / x_149.work_groups_x);
  merge_chunk_size = (merge_output_size / 2u);
  offs = (tint_wgid.x * merge_output_size);
  i_2 = 0u;
  loop {
    if ((i_2 < (merge_chunk_size / 64u))) {
    } else {
      break;
    }
    a_in = ((offs + (i_2 * 64u)) + gl_LocalInvocationID.x);
    b_in = (((offs + merge_chunk_size) + (i_2 * 64u)) + gl_LocalInvocationID.x);
    base_idx = (gl_LocalInvocationID.x + (i_2 * 64u));
    let x_201 = base_idx;
    let x_205 = a_in;
    param_1 = (offs + merge_chunk_size);
    param_2 = merge_chunk_size;
    param_3 = x_75.input_keys[x_205];
    let x_212 = upper_bound_u1_u1_u1_(&(param_1), &(param_2), &(param_3));
    a_loc = ((x_201 + x_212) - merge_chunk_size);
    let x_217 = base_idx;
    let x_218 = b_in;
    param_4 = offs;
    param_5 = merge_chunk_size;
    param_6 = x_75.input_keys[x_218];
    let x_226 = lower_bound_u1_u1_u1_(&(param_4), &(param_5), &(param_6));
    b_loc = (x_217 + x_226);
    let x_232 = a_loc;
    x_231.output_keys[x_232] = x_75.input_keys[a_in];
    let x_241 = a_loc;
    x_240.output_values[x_241] = x_245.input_values[a_in];
    let x_250 = b_loc;
    x_231.output_keys[x_250] = x_75.input_keys[b_in];
    let x_255 = b_loc;
    x_240.output_values[x_255] = x_245.input_values[b_in];

    continuing {
      i_2 = (i_2 + bitcast<u32>(1i));
    }
  }
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(workgroup_id) gl_WorkGroupID_param : vec3u, @builtin(local_invocation_id) gl_LocalInvocationID_param : vec3u) {
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  main_1(gl_WorkGroupID_param);
}
`;

const display_render_vert_spv = `var<private> gl_VertexIndex : i32;

var<private> gl_Position : vec4f;

const x_22 = vec4f(-1.0f, -1.0f, 0.5f, 1.0f);

const x_23 = vec4f(1.0f, 1.0f, 0.5f, 1.0f);

fn main_1() {
  var indexable : array<vec4f, 6u>;
  let x_28 = gl_VertexIndex;
  indexable = array<vec4f, 6u>(vec4f(-1.0f, 1.0f, 0.5f, 1.0f), x_22, x_23, x_22, x_23, vec4f(1.0f, -1.0f, 0.5f, 1.0f));
  gl_Position = indexable[x_28];
  return;
}

struct main_out {
  @builtin(position)
  gl_Position : vec4f,
}

@vertex
fn main(@builtin(vertex_index) gl_VertexIndex_param : u32) -> main_out {
  gl_VertexIndex = bitcast<i32>(gl_VertexIndex_param);
  main_1();
  return main_out(gl_Position);
}
`;

const display_render_frag_spv = `struct Resolution {
  /* @offset(0) */
  width : u32,
  /* @offset(4) */
  height : u32,
}

var<private> color : vec4f;

@group(0) @binding(0) var output_texture : texture_2d<f32>;

@group(0) @binding(2) var u_sampler : sampler;

var<private> gl_FragCoord : vec4f;

@group(0) @binding(1) var<uniform> x_28 : Resolution;

fn main_1() {
  color = textureSample(output_texture, u_sampler, (gl_FragCoord.xy / vec2f(f32(x_28.width), f32(x_28.height))));
  color.w = 1.0f;
  return;
}

struct main_out {
  @location(0)
  color_1 : vec4f,
}

@fragment
fn main(@builtin(position) gl_FragCoord_param : vec4f) -> main_out {
  gl_FragCoord = gl_FragCoord_param;
  main_1();
  return main_out(color);
}
`;

const reset_rays_comp_spv = `struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

struct RayInfo {
  /* @offset(0) */
  ray_dir : vec3f,
  /* @offset(12) */
  t : f32,
}

alias RTArr = array<RayInfo>;

struct RayInformation {
  /* @offset(0) */
  rays : RTArr,
}

alias RTArr_1 = array<u32>;

struct RayBlockIDs {
  /* @offset(0) */
  block_ids : RTArr_1,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(1) var<uniform> x_19 : VolumeParams;

@group(0) @binding(0) var<storage, read_write> x_46 : RayInformation;

@group(0) @binding(2) var<storage, read_write> x_56 : RayBlockIDs;

fn main_1() {
  var ray_index : u32;
  if ((gl_GlobalInvocationID.x >= x_19.image_width)) {
    return;
  }
  ray_index = (gl_GlobalInvocationID.x + (gl_GlobalInvocationID.y * x_19.image_width));
  let x_48 = ray_index;
  x_46.rays[x_48].ray_dir = vec3f();
  let x_57 = ray_index;
  x_56.block_ids[x_57] = 4294967295u;
  let x_60 = ray_index;
  x_46.rays[x_60].t = 340282346638528859811704183484516925440.0f;
  return;
}

@compute @workgroup_size(8i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const reset_block_active_comp_spv = `struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
}

alias RTArr = array<u32>;

struct BlockActive {
  /* @offset(0) */
  block_active : RTArr,
}

alias RTArr_1 = array<u32>;

struct BlockVisible {
  /* @offset(0) */
  block_visible : RTArr_1,
}

@group(0) @binding(0) var<uniform> x_15 : VolumeParams;

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(1) var<storage, read_write> x_59 : BlockActive;

@group(0) @binding(2) var<storage, read_write> x_67 : BlockVisible;

fn main_1() {
  var n_blocks : vec3u;
  var block_id : u32;
  n_blocks = (x_15.padded_dims.xyz / vec3u(4u));
  if ((gl_GlobalInvocationID.x >= n_blocks.x)) {
    return;
  }
  block_id = (gl_GlobalInvocationID.x + (n_blocks.x * (gl_GlobalInvocationID.y + (n_blocks.y * gl_GlobalInvocationID.z))));
  let x_61 = block_id;
  x_59.block_active[x_61] = 0u;
  let x_68 = block_id;
  x_67.block_visible[x_68] = 0u;
  return;
}

@compute @workgroup_size(8i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const reset_block_num_rays_comp_spv = `struct BlockIDOffset {
  /* @offset(0) */
  id_offset : u32,
  /* @offset(4) */
  total_visible_blocks : u32,
}

alias RTArr = array<u32>;

struct BlockNumRays {
  /* @offset(0) */
  block_num_rays : RTArr,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(0) var<uniform> x_18 : BlockIDOffset;

@group(0) @binding(1) var<storage, read_write> x_37 : BlockNumRays;

fn main_1() {
  var block_id : u32;
  block_id = (gl_GlobalInvocationID.x + x_18.id_offset);
  if ((block_id >= x_18.total_visible_blocks)) {
    return;
  }
  let x_38 = block_id;
  x_37.block_num_rays[x_38] = 0u;
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const debug_view_rays_per_block_comp_spv = `struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

struct RayInfo {
  /* @offset(0) */
  ray_dir : vec3f,
  /* @offset(12) */
  t : f32,
}

alias RTArr = array<RayInfo>;

struct RayInformation {
  /* @offset(0) */
  rays : RTArr,
}

alias RTArr_1 = array<u32>;

struct RayBlockIDs {
  /* @offset(0) */
  block_ids : RTArr_1,
}

alias RTArr_2 = array<u32>;

struct BlockNumRays {
  /* @offset(0) */
  block_num_rays : RTArr_2,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(0) var<uniform> x_24 : VolumeParams;

@group(0) @binding(2) var<storage, read_write> x_37 : RayInformation;

@group(0) @binding(4) var<storage, read_write> x_54 : RayBlockIDs;

@group(0) @binding(1) var<storage, read_write> x_63 : BlockNumRays;

@group(0) @binding(3) var render_target : texture_storage_2d<rgba8unorm, write>;

fn main_1() {
  var ray_index : u32;
  var block_id : u32;
  var color : vec4f;
  ray_index = (gl_GlobalInvocationID.x + (gl_GlobalInvocationID.y * x_24.image_width));
  if ((x_37.rays[ray_index].t == 340282346638528859811704183484516925440.0f)) {
    return;
  }
  block_id = x_54.block_ids[ray_index];
  let x_70 = vec3f((f32(x_63.block_num_rays[block_id]) / 256.0f));
  color.x = x_70.x;
  color.y = x_70.y;
  color.z = x_70.z;
  color.w = 1.0f;
  let x_87 = gl_GlobalInvocationID;
  let x_91 = color;
  textureStore(render_target, bitcast<vec2i>(x_87.xy), x_91);
  return;
}

@compute @workgroup_size(1i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const write_ray_and_block_id_comp_spv = `struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

alias RTArr = array<u32>;

struct RayActive {
  /* @offset(0) */
  ray_active : RTArr,
}

alias RTArr_1 = array<u32>;

struct RayBlockID {
  /* @offset(0) */
  block_id : RTArr_1,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(0) var<uniform> x_19 : VolumeParams;

@group(0) @binding(2) var<storage, read_write> x_44 : RayActive;

@group(0) @binding(1) var<storage, read_write> x_50 : RayBlockID;

fn main_1() {
  var ray_index : u32;
  if ((gl_GlobalInvocationID.x >= x_19.image_width)) {
    return;
  }
  ray_index = (gl_GlobalInvocationID.x + (gl_GlobalInvocationID.y * x_19.image_width));
  let x_46 = ray_index;
  x_44.ray_active[x_46] = bitcast<u32>(select(0i, 1i, (x_50.block_id[ray_index] != 4294967295u)));
  return;
}

@compute @workgroup_size(8i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const combine_block_information_comp_spv = `struct BlockIDOffset {
  /* @offset(0) */
  id_offset : u32,
  /* @offset(4) */
  total_work_groups : u32,
  /* @offset(8) */
  total_active_blocks : u32,
}

alias RTArr = array<u32>;

struct BlockIDs {
  /* @offset(0) */
  block_ids : RTArr,
}

struct BlockInfo {
  /* @offset(0) */
  id : u32,
  /* @offset(4) */
  ray_offset : u32,
  /* @offset(8) */
  num_rays : u32,
  /* @offset(12) */
  lod : u32,
}

alias RTArr_1 = array<BlockInfo>;

struct BlockInformation {
  /* @offset(0) */
  blocks : RTArr_1,
}

alias RTArr_2 = array<u32>;

struct BlockRayOffset {
  /* @offset(0) */
  block_ray_offsets : RTArr_2,
}

alias RTArr_3 = array<u32>;

struct BlockNumRays {
  /* @offset(0) */
  block_num_rays : RTArr_3,
}

alias RTArr_4 = array<u32>;

struct BlockActive {
  /* @offset(0) */
  block_active : RTArr_4,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(1) @binding(0) var<uniform> x_18 : BlockIDOffset;

@group(0) @binding(1) var<storage, read_write> x_40 : BlockIDs;

@group(0) @binding(0) var<storage, read_write> x_48 : BlockInformation;

@group(0) @binding(2) var<storage, read_write> x_57 : BlockRayOffset;

@group(0) @binding(3) var<storage, read_write> x_66 : BlockNumRays;

@group(0) @binding(4) var<storage, read_write> x_79 : BlockActive;

fn main_1() {
  var item_idx : u32;
  var id : u32;
  item_idx = (gl_GlobalInvocationID.x + (x_18.id_offset * 64u));
  if ((item_idx >= x_18.total_active_blocks)) {
    return;
  }
  id = x_40.block_ids[item_idx];
  let x_49 = item_idx;
  x_48.blocks[x_49].id = id;
  let x_52 = item_idx;
  x_48.blocks[x_52].ray_offset = x_57.block_ray_offsets[item_idx];
  let x_62 = item_idx;
  x_48.blocks[x_62].num_rays = x_66.block_num_rays[item_idx];
  let x_71 = item_idx;
  x_48.blocks[x_71].lod = 0u;
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const raytrace_active_block_comp_spv = `struct GridIterator {
  grid_dims : vec3i,
  grid_step : vec3i,
  t_delta : vec3f,
  cell : vec3i,
  t_max : vec3f,
  t : f32,
}

struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

alias RTArr = array<i32>;

struct BlockLocations {
  /* @offset(0) */
  block_locations : RTArr,
}

alias RTArr_1 = array<f32>;

struct Decompressed {
  /* @offset(0) */
  decompressed : RTArr_1,
}

struct BlockInfo {
  id : u32,
  ray_offset : u32,
  num_rays : u32,
  lod : u32,
}

struct BlockInfo_1 {
  /* @offset(0) */
  id : u32,
  /* @offset(4) */
  ray_offset : u32,
  /* @offset(8) */
  num_rays : u32,
  /* @offset(12) */
  lod : u32,
}

alias RTArr_2 = array<BlockInfo_1>;

struct BlockInformation {
  /* @offset(0) */
  blocks : RTArr_2,
}

struct BlockIDOffset {
  /* @offset(0) */
  id_offset : u32,
  /* @offset(4) */
  total_active_blocks : u32,
}

struct ViewParams {
  /* @offset(0) */
  proj_view : mat4x4f,
  /* @offset(64) */
  eye_pos : vec4f,
  /* @offset(80) */
  eye_dir : vec4f,
  /* @offset(96) */
  near_plane : f32,
  /* @offset(100) */
  current_pass_index : u32,
}

alias RTArr_3 = array<u32>;

struct RayIDs {
  /* @offset(0) */
  ray_ids : RTArr_3,
}

alias RTArr_4 = array<u32>;

struct SpeculativeIDs {
  /* @offset(0) */
  spec_ids : RTArr_4,
}

struct RayInfo {
  /* @offset(0) */
  ray_dir : vec3f,
  /* @offset(12) */
  t : f32,
}

alias RTArr_5 = array<RayInfo>;

struct RayInformation {
  /* @offset(0) */
  rays : RTArr_5,
}

alias RTArr_6 = array<vec2f>;

struct RayRGBZ {
  /* @offset(0) */
  ray_rgbz : RTArr_6,
}

@group(0) @binding(0) var<uniform> x_409 : VolumeParams;

var<workgroup> volume_block : array<f32, 128u>;

@group(0) @binding(2) var<storage, read_write> x_621 : BlockLocations;

@group(0) @binding(1) var<storage, read_write> x_766 : Decompressed;

var<private> gl_LocalInvocationID : vec3u;

var<workgroup> block_info : BlockInfo;

@group(1) @binding(3) var<storage, read_write> x_1609 : BlockInformation;

@group(2) @binding(0) var<uniform> x_1615 : BlockIDOffset;

@group(1) @binding(0) var<uniform> x_1675 : ViewParams;

@group(1) @binding(2) var<storage, read_write> x_1741 : RayIDs;

@group(1) @binding(5) var<storage, read_write> x_1756 : SpeculativeIDs;

@group(1) @binding(1) var<storage, read_write> x_1768 : RayInformation;

@group(1) @binding(6) var<storage, read_write> x_1927 : RayRGBZ;

@group(1) @binding(4) var render_target : texture_storage_2d<rgba8unorm, write>;

const x_427 = vec3u(4u);

fn block_id_to_pos_u1_(id_1 : ptr<function, u32>) -> vec3u {
  var n_blocks : vec3u;
  n_blocks = (x_409.padded_dims.xyz / x_427);
  let x_429 = *(id_1);
  let x_431 = n_blocks.x;
  let x_433 = *(id_1);
  let x_435 = n_blocks.x;
  let x_438 = n_blocks.y;
  let x_440 = *(id_1);
  let x_442 = n_blocks.x;
  let x_444 = n_blocks.y;
  return vec3u((x_429 % x_431), ((x_433 / x_435) % x_438), (x_440 / (x_442 * x_444)));
}

fn compute_block_id_vu3_(block_pos : ptr<function, vec3u>) -> u32 {
  var n_blocks_1 : vec3u;
  n_blocks_1 = (x_409.padded_dims.xyz / x_427);
  let x_456 = (*(block_pos)).x;
  let x_458 = n_blocks_1.x;
  let x_460 = (*(block_pos)).y;
  let x_462 = n_blocks_1.y;
  let x_464 = (*(block_pos)).z;
  return (x_456 + (x_458 * (x_460 + (x_462 * x_464))));
}

const x_608 = vec3u(5u);

const x_614 = vec3u(1u);

const x_632 = vec2u(5u);

const x_639 = vec3u(1u, 1u, 0u);

const x_649 = vec2u(4u);

const x_661 = vec3u(1u, 0u, 1u);

const x_682 = vec3u(0u, 1u, 1u);

const x_702 = vec3u(1u, 0u, 0u);

const x_719 = vec3u(0u, 1u, 0u);

const x_736 = vec3u(0u, 0u, 1u);

fn compute_block_dims_with_ghost_vu3_(block_pos_1 : vec3u) -> vec3u {
  var n_blocks_2 : vec3u;
  var block_dims_3 : vec3u;
  var corner : u32;
  var param : vec3u;
  var edge : u32;
  var param_1 : vec3u;
  var edge_1 : u32;
  var param_2 : vec3u;
  var edge_2 : u32;
  var param_3 : vec3u;
  var face : u32;
  var param_4 : vec3u;
  var face_1 : u32;
  var param_5 : vec3u;
  var face_2 : u32;
  var param_6 : vec3u;
  n_blocks_2 = (x_409.padded_dims.xyz / x_427);
  block_dims_3 = x_427;
  if (((block_pos_1.x + 1u) < n_blocks_2.x)) {
    block_dims_3.x = 5u;
  }
  if (((block_pos_1.y + 1u) < n_blocks_2.y)) {
    block_dims_3.y = 5u;
  }
  if (((block_pos_1.z + 1u) < n_blocks_2.z)) {
    block_dims_3.z = 5u;
  }
  if (all((block_dims_3 == x_608))) {
    param = (block_pos_1 + x_614);
    let x_617 = compute_block_id_vu3_(&(param));
    corner = x_617;
    if ((x_621.block_locations[corner] == -1i)) {
      block_dims_3 = x_427;
    }
  }
  if (all((block_dims_3.xy == x_632))) {
    param_1 = (block_pos_1 + x_639);
    let x_642 = compute_block_id_vu3_(&(param_1));
    edge = x_642;
    if ((x_621.block_locations[edge] == -1i)) {
      block_dims_3.x = x_649.x;
      block_dims_3.y = x_649.y;
    }
  }
  if (all((block_dims_3.xz == x_632))) {
    param_2 = (block_pos_1 + x_661);
    let x_664 = compute_block_id_vu3_(&(param_2));
    edge_1 = x_664;
    if ((x_621.block_locations[edge_1] == -1i)) {
      block_dims_3.x = x_649.x;
      block_dims_3.z = x_649.y;
    }
  }
  if (all((block_dims_3.yz == x_632))) {
    param_3 = (block_pos_1 + x_682);
    let x_685 = compute_block_id_vu3_(&(param_3));
    edge_2 = x_685;
    if ((x_621.block_locations[edge_2] == -1i)) {
      block_dims_3.y = x_649.x;
      block_dims_3.z = x_649.y;
    }
  }
  if ((block_dims_3.x == 5u)) {
    param_4 = (block_pos_1 + x_702);
    let x_705 = compute_block_id_vu3_(&(param_4));
    face = x_705;
    if ((x_621.block_locations[face] == -1i)) {
      block_dims_3.x = 4u;
    }
  }
  if ((block_dims_3.y == 5u)) {
    param_5 = (block_pos_1 + x_719);
    let x_722 = compute_block_id_vu3_(&(param_5));
    face_1 = x_722;
    if ((x_621.block_locations[face_1] == -1i)) {
      block_dims_3.y = 4u;
    }
  }
  if ((block_dims_3.z == 5u)) {
    param_6 = (block_pos_1 + x_736);
    let x_739 = compute_block_id_vu3_(&(param_6));
    face_2 = x_739;
    if ((x_621.block_locations[face_2] == -1i)) {
      block_dims_3.z = 4u;
    }
  }
  let x_747 = block_dims_3;
  return x_747;
}

fn voxel_id_to_voxel_u1_(id_2 : ptr<function, u32>) -> vec3u {
  let x_471 = *(id_2);
  let x_473 = *(id_2);
  let x_476 = *(id_2);
  return vec3u((x_471 % 4u), ((x_473 / 4u) % 4u), (x_476 / 16u));
}

fn compute_voxel_id_vu3_vu3_(voxel_pos : ptr<function, vec3u>, block_dims : ptr<function, vec3u>) -> u32 {
  let x_483 = (*(voxel_pos)).x;
  let x_485 = (*(block_dims)).x;
  let x_487 = (*(voxel_pos)).y;
  let x_489 = (*(block_dims)).y;
  let x_491 = (*(voxel_pos)).z;
  return (x_483 + (x_485 * (x_487 + (x_489 * x_491))));
}

fn load_voxel_u1_vu3_vu3_vu3_(neighbor_id : u32, ghost_voxel_pos : vec3u, neighbor_voxel_pos : vec3u, block_dims_2 : vec3u) {
  var neighbor_location : u32;
  var ghost_voxel_id : u32;
  var param_7 : vec3u;
  var param_8 : vec3u;
  var neighbor_voxel_id : u32;
  var param_9 : vec3u;
  var param_10 : vec3u;
  neighbor_location = bitcast<u32>(x_621.block_locations[neighbor_id]);
  param_7 = ghost_voxel_pos;
  param_8 = block_dims_2;
  let x_757 = compute_voxel_id_vu3_vu3_(&(param_7), &(param_8));
  ghost_voxel_id = x_757;
  param_9 = neighbor_voxel_pos;
  param_10 = x_427;
  let x_761 = compute_voxel_id_vu3_vu3_(&(param_9), &(param_10));
  neighbor_voxel_id = x_761;
  let x_762 = ghost_voxel_id;
  volume_block[x_762] = x_766.decompressed[((neighbor_location * 64u) + neighbor_voxel_id)];
  return;
}

const x_834 = array<vec3u, 3u>(x_702, x_719, x_736);

const x_890 = array<vec3u, 3u>(x_639, x_661, x_682);

fn load_block_u1_(block_id : u32) -> vec3u {
  var block_pos_2 : vec3u;
  var param_11 : u32;
  var n_blocks_3 : vec3u;
  var block_dims_4 : vec3u;
  var voxel_pos_2 : vec3u;
  var param_12 : u32;
  var i_1 : u32;
  var ghost_voxel_pos_1 : vec3u;
  var indexable_1 : array<vec3u, 3u>;
  var neighbor_voxel_pos_1 : vec3u;
  var indexable_2 : array<vec3u, 3u>;
  var indexable_3 : array<vec3u, 3u>;
  var neighbor_block_pos : vec3u;
  var indexable_4 : array<vec3u, 3u>;
  var neighbor_id_1 : u32;
  var param_13 : vec3u;
  var i_2 : u32;
  var b : vec3u;
  var indexable_5 : array<vec3u, 3u>;
  var p_3 : vec3u;
  var indexable_6 : array<vec3u, 3u>;
  var ghost_voxel_pos_2 : vec3u;
  var indexable_7 : array<vec3u, 3u>;
  var neighbor_voxel_pos_2 : vec3u;
  var indexable_8 : array<vec3u, 3u>;
  var indexable_9 : array<vec3u, 3u>;
  var indexable_10 : array<vec3u, 3u>;
  var neighbor_block_pos_1 : vec3u;
  var indexable_11 : array<vec3u, 3u>;
  var neighbor_id_2 : u32;
  var param_14 : vec3u;
  var ghost_voxel_pos_3 : vec3u;
  var neighbor_block_pos_2 : vec3u;
  var neighbor_id_3 : u32;
  var param_15 : vec3u;
  let x_780 = gl_LocalInvocationID.x;
  volume_block[(x_780 * 2u)] = 0.0f;
  let x_784 = gl_LocalInvocationID.x;
  volume_block[((x_784 * 2u) + 1u)] = 0.0f;
  workgroupBarrier();
  param_11 = block_id;
  let x_791 = block_id_to_pos_u1_(&(param_11));
  block_pos_2 = x_791;
  n_blocks_3 = (x_409.padded_dims.xyz / x_427);
  let x_798 = block_pos_2;
  let x_799 = compute_block_dims_with_ghost_vu3_(x_798);
  block_dims_4 = x_799;
  param_12 = gl_LocalInvocationID.x;
  let x_804 = voxel_id_to_voxel_u1_(&(param_12));
  voxel_pos_2 = x_804;
  let x_805 = voxel_pos_2;
  let x_806 = voxel_pos_2;
  let x_807 = block_dims_4;
  load_voxel_u1_vu3_vu3_vu3_(block_id, x_805, x_806, x_807);
  i_1 = 0u;
  loop {
    var x_827 : bool;
    var x_828 : bool;
    if ((i_1 < 3u)) {
    } else {
      break;
    }
    let x_821 = (block_dims_4[i_1] == 5u);
    x_828 = x_821;
    if (x_821) {
      x_827 = (voxel_pos_2[i_1] == 3u);
      x_828 = x_827;
    }
    if (x_828) {
      let x_832 = voxel_pos_2;
      let x_835 = i_1;
      indexable_1 = x_834;
      ghost_voxel_pos_1 = (x_832 + indexable_1[x_835]);
      neighbor_voxel_pos_1 = ghost_voxel_pos_1;
      let x_843 = i_1;
      indexable_2 = x_834;
      if ((indexable_2[x_843].x == 1u)) {
        neighbor_voxel_pos_1.x = 0u;
      } else {
        let x_852 = i_1;
        indexable_3 = x_834;
        if ((indexable_3[x_852].y == 1u)) {
          neighbor_voxel_pos_1.y = 0u;
        } else {
          neighbor_voxel_pos_1.z = 0u;
        }
      }
      let x_863 = block_pos_2;
      let x_864 = i_1;
      indexable_4 = x_834;
      neighbor_block_pos = (x_863 + indexable_4[x_864]);
      param_13 = neighbor_block_pos;
      let x_872 = compute_block_id_vu3_(&(param_13));
      neighbor_id_1 = x_872;
      let x_873 = neighbor_id_1;
      let x_874 = ghost_voxel_pos_1;
      let x_875 = neighbor_voxel_pos_1;
      let x_876 = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_873, x_874, x_875, x_876);
    }

    continuing {
      i_1 = (i_1 + bitcast<u32>(1i));
    }
  }
  i_2 = 0u;
  loop {
    var x_924 : bool;
    var x_925 : bool;
    if ((i_2 < 3u)) {
    } else {
      break;
    }
    let x_889 = block_dims_4;
    let x_891 = i_2;
    indexable_5 = x_890;
    b = (x_889 * indexable_5[x_891]);
    let x_897 = voxel_pos_2;
    let x_898 = i_2;
    indexable_6 = x_890;
    p_3 = (x_897 * indexable_6[x_898]);
    let x_912 = (((b.x + b.y) + b.z) == 10u);
    x_925 = x_912;
    if (x_912) {
      x_924 = (((p_3.x + p_3.y) + p_3.z) == 6u);
      x_925 = x_924;
    }
    if (x_925) {
      let x_929 = voxel_pos_2;
      let x_930 = i_2;
      indexable_7 = x_890;
      ghost_voxel_pos_2 = (x_929 + indexable_7[x_930]);
      neighbor_voxel_pos_2 = ghost_voxel_pos_2;
      let x_937 = i_2;
      indexable_8 = x_890;
      if ((indexable_8[x_937].x == 1u)) {
        neighbor_voxel_pos_2.x = 0u;
      }
      let x_945 = i_2;
      indexable_9 = x_890;
      if ((indexable_9[x_945].y == 1u)) {
        neighbor_voxel_pos_2.y = 0u;
      }
      let x_953 = i_2;
      indexable_10 = x_890;
      if ((indexable_10[x_953].z == 1u)) {
        neighbor_voxel_pos_2.z = 0u;
      }
      let x_962 = block_pos_2;
      let x_963 = i_2;
      indexable_11 = x_890;
      neighbor_block_pos_1 = (x_962 + indexable_11[x_963]);
      param_14 = neighbor_block_pos_1;
      let x_971 = compute_block_id_vu3_(&(param_14));
      neighbor_id_2 = x_971;
      let x_972 = neighbor_id_2;
      let x_973 = ghost_voxel_pos_2;
      let x_974 = neighbor_voxel_pos_2;
      let x_975 = block_dims_4;
      load_voxel_u1_vu3_vu3_vu3_(x_972, x_973, x_974, x_975);
    }

    continuing {
      i_2 = (i_2 + bitcast<u32>(1i));
    }
  }
  if ((all((block_dims_4 == x_608)) & all((voxel_pos_2 == vec3u(3u))))) {
    ghost_voxel_pos_3 = (voxel_pos_2 + x_614);
    neighbor_block_pos_2 = (block_pos_2 + x_614);
    param_15 = neighbor_block_pos_2;
    let x_998 = compute_block_id_vu3_(&(param_15));
    neighbor_id_3 = x_998;
    let x_999 = neighbor_id_3;
    let x_1000 = ghost_voxel_pos_3;
    let x_1002 = block_dims_4;
    load_voxel_u1_vu3_vu3_vu3_(x_999, x_1000, vec3u(), x_1002);
  }
  workgroupBarrier();
  let x_1004 = block_dims_4;
  return x_1004;
}

fn ray_id_to_pos_u1_(id : ptr<function, u32>) -> vec2u {
  let x_405 = *(id);
  let x_412 = x_409.image_width;
  let x_414 = *(id);
  let x_416 = x_409.image_width;
  return vec2u((x_405 % x_412), (x_414 / x_416));
}

fn intersect_box_vf3_vf3_vf3_vf3_(orig : ptr<function, vec3f>, dir : ptr<function, vec3f>, box_min : vec3f, box_max : vec3f) -> vec2f {
  var inv_dir : vec3f;
  var tmin_tmp : vec3f;
  var tmax_tmp : vec3f;
  var tmin : vec3f;
  var tmax : vec3f;
  var t0 : f32;
  var t1 : f32;
  inv_dir = (vec3f(1.0f) / *(dir));
  tmin_tmp = ((box_min - *(orig)) * inv_dir);
  tmax_tmp = ((box_max - *(orig)) * inv_dir);
  tmin = min(tmin_tmp, tmax_tmp);
  tmax = max(tmin_tmp, tmax_tmp);
  t0 = max(tmin.x, max(tmin.y, tmin.z));
  t1 = min(tmax.x, min(tmax.y, tmax.z));
  let x_364 = t0;
  let x_365 = t1;
  return vec2f(x_364, x_365);
}

const x_200 = vec3f(1.0f);

fn init_grid_iterator_vf3_vf3_f1_vi3_(ray_org : ptr<function, vec3f>, ray_dir : ptr<function, vec3f>, t : ptr<function, f32>, grid_dims_1 : ptr<function, vec3i>) -> GridIterator {
  var grid_iter : GridIterator;
  var inv_ray_dir : vec3f;
  var p_2 : vec3f;
  var cell : vec3f;
  var t_max_neg : vec3f;
  var t_max_pos : vec3f;
  var is_neg_dir : vec3<bool>;
  grid_iter.grid_dims = *(grid_dims_1);
  grid_iter.grid_step = vec3i(sign(*(ray_dir)));
  inv_ray_dir = (vec3f(1.0f) / *(ray_dir));
  grid_iter.t_delta = abs(inv_ray_dir);
  p_2 = (*(ray_org) + (*(ray_dir) * *(t)));
  p_2 = clamp(p_2, vec3f(), vec3f((*(grid_dims_1) - vec3i(1i))));
  cell = floor(p_2);
  t_max_neg = ((cell - *(ray_org)) * inv_ray_dir);
  t_max_pos = (((cell + x_200) - *(ray_org)) * inv_ray_dir);
  is_neg_dir = (*(ray_dir) < vec3f());
  grid_iter.t_max = select(t_max_pos, t_max_neg, is_neg_dir);
  grid_iter.cell = vec3i(cell);
  grid_iter.t = *(t);
  let x_223 = grid_iter;
  return x_223;
}

fn outside_grid_vi3_vi3_(p : vec3i, grid_dims : vec3i) -> bool {
  var x_154 : bool;
  var x_155 : bool;
  let x_149 = any((p < vec3i()));
  x_155 = x_149;
  if (!(x_149)) {
    x_154 = any((p >= grid_dims));
    x_155 = x_154;
  }
  return x_155;
}

fn grid_iterator_get_cell_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_vf2_vi3_(iter : ptr<function, GridIterator>, cell_t_range : ptr<function, vec2f>, cell_id : ptr<function, vec3i>) -> bool {
  let x_227 = (*(iter)).cell;
  let x_229 = (*(iter)).grid_dims;
  let x_230 = outside_grid_vi3_vi3_(x_227, x_229);
  if (x_230) {
    return false;
  }
  (*(cell_t_range)).x = (*(iter)).t;
  (*(cell_t_range)).y = min((*(iter)).t_max.x, min((*(iter)).t_max.y, (*(iter)).t_max.z));
  *(cell_id) = (*(iter)).cell;
  if (((*(cell_t_range)).y < (*(cell_t_range)).x)) {
    return false;
  }
  return true;
}

fn compute_vertex_values_vu3_vu3_f1_8__vf2_(voxel_pos_1 : ptr<function, vec3u>, block_dims_1 : ptr<function, vec3u>, values : ptr<function, array<f32, 8u>>, value_range : ptr<function, vec2f>) {
  var i : i32;
  var v : vec3u;
  var indexable : array<vec3i, 8u>;
  var voxel : u32;
  (*(value_range)).x = 100000002004087734272.0f;
  (*(value_range)).y = -100000002004087734272.0f;
  i = 0i;
  loop {
    if ((i < 8i)) {
    } else {
      break;
    }
    let x_520 = i;
    indexable = array<vec3i, 8u>(vec3i(), vec3i(1i, 0i, 0i), vec3i(0i, 1i, 0i), vec3i(1i, 1i, 0i), vec3i(0i, 0i, 1i), vec3i(1i, 0i, 1i), vec3i(0i, 1i, 1i), vec3i(1i));
    v = bitcast<vec3u>(indexable[x_520]);
    voxel = ((((((((*(voxel_pos_1)).z + v.z) * (*(block_dims_1)).y) + (*(voxel_pos_1)).y) + v.y) * (*(block_dims_1)).x) + (*(voxel_pos_1)).x) + v.x);
    let x_550 = i;
    (*(values))[x_550] = volume_block[voxel];
    (*(value_range)).x = min((*(value_range)).x, (*(values))[i]);
    (*(value_range)).y = max((*(value_range)).y, (*(values))[i]);

    continuing {
      i = (i + 1i);
    }
  }
  return;
}

fn compute_polynomial_vf3_vf3_vf3_f1_8__(p_1 : vec3f, dir_1 : vec3f, v000 : vec3f, values_1 : ptr<function, array<f32, 8u>>) -> vec4f {
  var v111 : vec3f;
  var a : array<vec3f, 2u>;
  var b_1 : array<vec3f, 2u>;
  var poly_2 : vec4f;
  var k : i32;
  var j : i32;
  var i_3 : i32;
  var val : f32;
  v111 = (v000 + x_200);
  a = array<vec3f, 2u>((v111 - p_1), (p_1 - v000));
  b_1 = array<vec3f, 2u>(-(dir_1), dir_1);
  poly_2 = vec4f();
  k = 0i;
  loop {
    if ((k < 2i)) {
    } else {
      break;
    }
    j = 0i;
    loop {
      if ((j < 2i)) {
      } else {
        break;
      }
      i_3 = 0i;
      loop {
        if ((i_3 < 2i)) {
        } else {
          break;
        }
        val = (*(values_1))[(i_3 + (2i * (j + (2i * k))))];
        poly_2.x = (poly_2.x + (((b_1[i_3].x * b_1[j].y) * b_1[k].z) * val));
        poly_2.y = (poly_2.y + (((((a[i_3].x * b_1[j].y) * b_1[k].z) + ((b_1[i_3].x * a[j].y) * b_1[k].z)) + ((b_1[i_3].x * b_1[j].y) * a[k].z)) * val));
        poly_2.z = (poly_2.z + (((((b_1[i_3].x * a[j].y) * a[k].z) + ((a[i_3].x * b_1[j].y) * a[k].z)) + ((a[i_3].x * a[j].y) * b_1[k].z)) * val));
        poly_2.w = (poly_2.w + (((a[i_3].x * a[j].y) * a[k].z) * val));

        continuing {
          i_3 = (i_3 + 1i);
        }
      }

      continuing {
        j = (j + 1i);
      }
    }

    continuing {
      k = (k + 1i);
    }
  }
  let x_1178 = poly_2;
  return x_1178;
}

fn evaluate_polynomial_vf4_f1_(poly : vec4f, t_1 : f32) -> f32 {
  return ((((((poly.x * t_1) * t_1) * t_1) + ((poly.y * t_1) * t_1)) + (poly.z * t_1)) + poly.w);
}

fn solve_quadratic_vf3_f1_2__(poly_1 : vec3f, roots : ptr<function, array<f32, 2u>>) -> bool {
  var discriminant : f32;
  var r : vec2f;
  if ((poly_1.x == 0.0f)) {
    (*(roots))[0i] = (-(poly_1.z) / poly_1.y);
    (*(roots))[1i] = (-(poly_1.z) / poly_1.y);
    return true;
  }
  discriminant = (pow(poly_1.y, 2.0f) - ((4.0f * poly_1.x) * poly_1.z));
  if ((discriminant < 0.0f)) {
    return false;
  }
  discriminant = sqrt(discriminant);
  r = ((vec2f((-(poly_1.y) + discriminant), (-(poly_1.y) - discriminant)) * 0.5f) / vec2f(poly_1.x));
  (*(roots))[0i] = min(r.x, r.y);
  (*(roots))[1i] = max(r.x, r.y);
  return true;
}

fn marmitt_intersect_vf3_vf3_vf3_f1_8__f1_f1_f1_(vol_eye : vec3f, grid_ray_dir : vec3f, v000_2 : vec3f, vertex_values_1 : array<f32, 8u>, t_prev : f32, t_next : f32, t_hit : ptr<function, f32>) -> bool {
  var cell_p : vec3f;
  var t_in : f32;
  var t_out : f32;
  var cell_ray_dir : vec3f;
  var poly_3 : vec4f;
  var param_16 : array<f32, 8u>;
  var f_in : f32;
  var f_out : f32;
  var roots_1 : array<f32, 2u>;
  var param_17 : array<f32, 2u>;
  var f_root0 : f32;
  var f_root1 : f32;
  var i_5 : i32;
  var t_2 : f32;
  var f_t : f32;
  var cell_t_hit : f32;
  var hit_p_1 : vec3f;
  if ((t_next <= t_prev)) {
    return false;
  }
  var x_1469 : bool;
  var x_1470 : bool;
  var x_1501 : bool;
  var x_1502 : bool;
  cell_p = (vol_eye + (grid_ray_dir * (t_prev + ((t_next - t_prev) * 0.5f))));
  t_in = ((-((t_next - t_prev)) * 0.5f) * length(grid_ray_dir));
  t_out = (((t_next - t_prev) * 0.5f) * length(grid_ray_dir));
  cell_ray_dir = normalize(grid_ray_dir);
  let x_1425 = cell_p;
  let x_1426 = cell_ray_dir;
  param_16 = vertex_values_1;
  let x_1428 = compute_polynomial_vf3_vf3_vf3_f1_8__(x_1425, x_1426, v000_2, &(param_16));
  poly_3 = x_1428;
  poly_3.w = (poly_3.w - x_409.isovalue);
  let x_1436 = poly_3;
  let x_1437 = t_in;
  let x_1438 = evaluate_polynomial_vf4_f1_(x_1436, x_1437);
  f_in = x_1438;
  let x_1440 = poly_3;
  let x_1441 = t_out;
  let x_1442 = evaluate_polynomial_vf4_f1_(x_1440, x_1441);
  f_out = x_1442;
  roots_1 = array<f32, 2u>();
  let x_1447 = poly_3.x;
  let x_1450 = poly_3.y;
  let x_1453 = poly_3.z;
  let x_1456 = solve_quadratic_vf3_f1_2__(vec3f((3.0f * x_1447), (2.0f * x_1450), x_1453), &(param_17));
  roots_1 = param_17;
  if (x_1456) {
    let x_1463 = (roots_1[0i] >= t_in);
    x_1470 = x_1463;
    if (x_1463) {
      x_1469 = (roots_1[0i] <= t_out);
      x_1470 = x_1469;
    }
    if (x_1470) {
      let x_1474 = poly_3;
      let x_1476 = roots_1[0i];
      let x_1477 = evaluate_polynomial_vf4_f1_(x_1474, x_1476);
      f_root0 = x_1477;
      if ((sign(f_root0) == sign(f_in))) {
        t_in = roots_1[0i];
        f_in = f_root0;
      } else {
        t_out = roots_1[0i];
        f_out = f_root0;
      }
    }
    let x_1495 = (roots_1[1i] >= t_in);
    x_1502 = x_1495;
    if (x_1495) {
      x_1501 = (roots_1[1i] <= t_out);
      x_1502 = x_1501;
    }
    if (x_1502) {
      let x_1506 = poly_3;
      let x_1508 = roots_1[1i];
      let x_1509 = evaluate_polynomial_vf4_f1_(x_1506, x_1508);
      f_root1 = x_1509;
      if ((sign(f_root1) == sign(f_in))) {
        t_in = roots_1[1i];
        f_in = f_root1;
      } else {
        t_out = roots_1[1i];
        f_out = f_root1;
      }
    }
  }
  if (!((sign(f_in) == sign(f_out)))) {
    i_5 = 0i;
    loop {
      if ((i_5 < 3i)) {
      } else {
        break;
      }
      t_2 = (t_in + (((t_out - t_in) * -(f_in)) / (f_out - f_in)));
      let x_1553 = poly_3;
      let x_1554 = t_2;
      let x_1555 = evaluate_polynomial_vf4_f1_(x_1553, x_1554);
      f_t = x_1555;
      if ((sign(f_t) == sign(f_in))) {
        t_in = t_2;
        f_in = f_t;
      } else {
        t_out = t_2;
        f_out = f_t;
      }

      continuing {
        i_5 = (i_5 + 1i);
      }
    }
    cell_t_hit = (t_in + (((t_out - t_in) * -(f_in)) / (f_out - f_in)));
    hit_p_1 = (cell_p + (cell_ray_dir * cell_t_hit));
    *(t_hit) = (length((hit_p_1 - vol_eye)) / length(grid_ray_dir));
    return true;
  }
  return false;
}

fn grid_iterator_advance_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_(iter_1 : ptr<function, GridIterator>) {
  (*(iter_1)).t = min((*(iter_1)).t_max.x, min((*(iter_1)).t_max.y, (*(iter_1)).t_max.z));
  if (((*(iter_1)).t == (*(iter_1)).t_max.x)) {
    (*(iter_1)).cell.x = ((*(iter_1)).cell.x + (*(iter_1)).grid_step.x);
    (*(iter_1)).t_max.x = ((*(iter_1)).t_max.x + (*(iter_1)).t_delta.x);
  } else {
    if (((*(iter_1)).t == (*(iter_1)).t_max.y)) {
      (*(iter_1)).cell.y = ((*(iter_1)).cell.y + (*(iter_1)).grid_step.y);
      (*(iter_1)).t_max.y = ((*(iter_1)).t_max.y + (*(iter_1)).t_delta.y);
    } else {
      (*(iter_1)).cell.z = ((*(iter_1)).cell.z + (*(iter_1)).grid_step.z);
      (*(iter_1)).t_max.z = ((*(iter_1)).t_max.z + (*(iter_1)).t_delta.z);
    }
  }
  return;
}

const x_1336 = array<f32, 2u>(-1.0f, 1.0f);

fn compute_normal_vi3_vf3_f1_8__(v000_1 : vec3i, hit_p : vec3f, vertex_values : array<f32, 8u>) -> vec3f {
  var N_1 : vec3f;
  var v111_1 : vec3f;
  var a_1 : array<vec3f, 2u>;
  var k_1 : i32;
  var j_1 : i32;
  var i_4 : i32;
  var val_1 : f32;
  var indexable_12 : array<f32, 8u>;
  var indexable_13 : array<f32, 2u>;
  var indexable_14 : array<f32, 2u>;
  var indexable_15 : array<f32, 2u>;
  N_1 = vec3f();
  v111_1 = (vec3f(v000_1) + x_200);
  a_1 = array<vec3f, 2u>((v111_1 - hit_p), (hit_p - vec3f(v000_1)));
  k_1 = 0i;
  loop {
    if ((k_1 < 2i)) {
    } else {
      break;
    }
    j_1 = 0i;
    loop {
      if ((j_1 < 2i)) {
      } else {
        break;
      }
      i_4 = 0i;
      loop {
        if ((i_4 < 2i)) {
        } else {
          break;
        }
        let x_1325 = i_4;
        let x_1326 = j_1;
        let x_1327 = k_1;
        indexable_12 = vertex_values;
        val_1 = indexable_12[(x_1325 + (2i * (x_1326 + (2i * x_1327))))];
        let x_1337 = i_4;
        indexable_13 = x_1336;
        N_1.x = (N_1.x + (((indexable_13[x_1337] * a_1[j_1].y) * a_1[k_1].z) * val_1));
        let x_1355 = j_1;
        indexable_14 = x_1336;
        N_1.y = (N_1.y + (((indexable_14[x_1355] * a_1[i_4].x) * a_1[k_1].z) * val_1));
        let x_1373 = k_1;
        indexable_15 = x_1336;
        N_1.z = (N_1.z + (((indexable_15[x_1373] * a_1[i_4].x) * a_1[j_1].y) * val_1));

        continuing {
          i_4 = (i_4 + 1i);
        }
      }

      continuing {
        j_1 = (j_1 + 1i);
      }
    }

    continuing {
      k_1 = (k_1 + 1i);
    }
  }
  let x_1397 = N_1;
  return normalize(x_1397);
}

fn shading_vf3_vf3_vf3_vf3_(N : ptr<function, vec3f>, V : ptr<function, vec3f>, L : ptr<function, vec3f>, base_color : ptr<function, vec3f>) -> vec3f {
  var H : vec3f;
  var c_1 : vec3f;
  H = normalize((*(V) + *(L)));
  c_1 = (*(base_color) * 0.20000000298023223877f);
  c_1 = (c_1 + (*(base_color) * (0.60000002384185791016f * clamp(dot(*(L), *(N)), 0.0f, 1.0f))));
  c_1 = (c_1 + vec3f((0.10000000149011611938f * pow(clamp(dot(H, *(N)), 0.0f, 1.0f), 5.0f))));
  let x_1287 = c_1;
  return x_1287;
}

fn pack_color_vf3_(rgb : ptr<function, vec3f>) -> i32 {
  var rbg256 : vec3i;
  var c : i32;
  rbg256 = clamp(vec3i((*(rgb) * 255.0f)), vec3i(), vec3i(255i));
  c = 0i;
  c = (c | ((rbg256.x << bitcast<u32>(24i)) & -16777216i));
  c = (c | ((rbg256.y << bitcast<u32>(16i)) & 16711680i));
  c = (c | ((rbg256.z << bitcast<u32>(8i)) & 65280i));
  let x_402 = c;
  return x_402;
}

fn main_1(tint_wgid : vec3u) {
  var block_dims_5 : vec3u;
  var n_blocks_4 : vec3u;
  var block_pos_3 : vec3u;
  var param_18 : u32;
  var volume_translation : vec3f;
  var transformed_eye : vec3f;
  var vol_eye_1 : vec3f;
  var chunks : u32;
  var i_6 : u32;
  var pixel_coords : vec2i;
  var color : vec4f;
  var ray_id : u32;
  var ray_index : u32;
  var param_19 : u32;
  var spec_index : u32;
  var grid_ray_dir_1 : vec3f;
  var hit_surface : bool;
  var hit_p_2 : vec3f;
  var cell_range : vec2f;
  var brick_range : vec2f;
  var param_20 : vec3f;
  var param_21 : vec3f;
  var grid_iter_1 : GridIterator;
  var param_22 : vec3f;
  var param_23 : vec3f;
  var param_24 : f32;
  var param_25 : vec3i;
  var v000_3 : vec3i;
  var cell_t_range_1 : vec2f;
  var param_26 : GridIterator;
  var param_27 : vec2f;
  var param_28 : vec3i;
  var vertex_values_2 : array<f32, 8u>;
  var param_29 : vec3u;
  var param_30 : vec3u;
  var param_31 : array<f32, 8u>;
  var param_32 : vec2f;
  var skip_cell : bool;
  var t_hit_1 : f32;
  var param_33 : f32;
  var param_34 : GridIterator;
  var N_2 : vec3f;
  var L_1 : vec3f;
  var V_1 : vec3f;
  var param_35 : vec3f;
  var param_36 : vec3f;
  var param_37 : vec3f;
  var param_38 : vec3f;
  var param_39 : vec3f;
  if ((gl_LocalInvocationID.x == 0u)) {
    let x_1621 = x_1609.blocks[(tint_wgid.x + x_1615.id_offset)];
    block_info.id = x_1621.id;
    block_info.ray_offset = x_1621.ray_offset;
    block_info.num_rays = x_1621.num_rays;
    block_info.lod = x_1621.lod;
  }
  workgroupBarrier();
  let x_1633 = block_info.id;
  let x_1634 = load_block_u1_(x_1633);
  block_dims_5 = x_1634;
  if (((tint_wgid.x + x_1615.id_offset) >= x_1615.total_active_blocks)) {
    return;
  }
  if ((block_info.num_rays == 0u)) {
    return;
  }
  n_blocks_4 = (x_409.padded_dims.xyz / x_427);
  param_18 = block_info.id;
  let x_1661 = block_id_to_pos_u1_(&(param_18));
  block_pos_3 = (x_1661 * vec3u(4u));
  volume_translation = (vec3f() - (x_409.volume_scale.xyz * 0.5f));
  transformed_eye = ((x_1675.eye_pos.xyz - volume_translation) / x_409.volume_scale.xyz);
  vol_eye_1 = (((transformed_eye * vec3f(x_409.volume_dims.xyz)) - vec3f(0.5f)) - vec3f(block_pos_3));
  chunks = (block_info.num_rays / 64u);
  if (((block_info.num_rays % 64u) != 0u)) {
    chunks = (chunks + bitcast<u32>(1i));
  }
  i_6 = 0u;
  loop {
    if ((i_6 < chunks)) {
    } else {
      break;
    }
    pixel_coords = vec2i(-1i);
    color = vec4f(1.0f);
    color.w = 1.0f;
    ray_id = ((i_6 * 64u) + gl_LocalInvocationID.x);
    if ((ray_id < block_info.num_rays)) {
      ray_index = x_1741.ray_ids[(block_info.ray_offset + ray_id)];
      param_19 = ray_index;
      let x_1750 = ray_id_to_pos_u1_(&(param_19));
      pixel_coords = bitcast<vec2i>(x_1750);
      spec_index = x_1756.spec_ids[(block_info.ray_offset + ray_id)];
      grid_ray_dir_1 = x_1768.rays[ray_index].ray_dir;
      hit_surface = false;
      hit_p_2 = vec3f();
      cell_range = vec2f();
      param_20 = vol_eye_1;
      param_21 = grid_ray_dir_1;
      let x_1784 = intersect_box_vf3_vf3_vf3_vf3_(&(param_20), &(param_21), vec3f(), vec3f(4.0f));
      brick_range = x_1784;
      if ((brick_range.y <= brick_range.x)) {
        continue;
      }
      let x_1795 = brick_range.x;
      let x_1798 = block_dims_5;
      param_22 = vol_eye_1;
      param_23 = grid_ray_dir_1;
      param_24 = (x_1795 - 0.00100000004749745131f);
      param_25 = (bitcast<vec3i>(x_1798) - vec3i(1i));
      let x_1808 = init_grid_iterator_vf3_vf3_f1_vi3_(&(param_22), &(param_23), &(param_24), &(param_25));
      grid_iter_1 = x_1808;
      v000_3 = vec3i();
      loop {
        var x_1848 : bool;
        var x_1849 : bool;
        param_26 = grid_iter_1;
        let x_1820 = grid_iterator_get_cell_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_vf2_vi3_(&(param_26), &(param_27), &(param_28));
        grid_iter_1 = param_26;
        cell_t_range_1 = param_27;
        v000_3 = param_28;
        if (x_1820) {
        } else {
          break;
        }
        param_29 = bitcast<vec3u>(v000_3);
        param_30 = block_dims_5;
        compute_vertex_values_vu3_vu3_f1_8__vf2_(&(param_29), &(param_30), &(param_31), &(param_32));
        vertex_values_2 = param_31;
        cell_range = param_32;
        let x_1840 = (x_409.isovalue < cell_range.x);
        x_1849 = x_1840;
        if (!(x_1840)) {
          x_1848 = (x_409.isovalue > cell_range.y);
          x_1849 = x_1848;
        }
        skip_cell = x_1849;
        if (!(skip_cell)) {
          let x_1854 = vol_eye_1;
          let x_1855 = grid_ray_dir_1;
          let x_1856 = v000_3;
          let x_1858 = vertex_values_2;
          let x_1860 = cell_t_range_1.x;
          let x_1862 = cell_t_range_1.y;
          let x_1865 = marmitt_intersect_vf3_vf3_vf3_f1_8__f1_f1_f1_(x_1854, x_1855, vec3f(x_1856), x_1858, x_1860, x_1862, &(param_33));
          t_hit_1 = param_33;
          hit_surface = x_1865;
          if (hit_surface) {
            hit_p_2 = (vol_eye_1 + (grid_ray_dir_1 * t_hit_1));
            break;
          }
        }
        param_34 = grid_iter_1;
        grid_iterator_advance_struct_GridIterator_vi3_vi3_vf3_vi3_vf3_f11_(&(param_34));
        grid_iter_1 = param_34;
      }
      if (hit_surface) {
        let x_1883 = ray_index;
        x_1768.rays[x_1883].t = 340282346638528859811704183484516925440.0f;
        let x_1887 = v000_3;
        let x_1888 = hit_p_2;
        let x_1889 = vertex_values_2;
        let x_1890 = compute_normal_vi3_vf3_f1_8__(x_1887, x_1888, x_1889);
        N_2 = x_1890;
        L_1 = normalize(-(grid_ray_dir_1));
        V_1 = normalize(-(grid_ray_dir_1));
        if ((dot(N_2, grid_ray_dir_1) > 0.0f)) {
          N_2 = -(N_2);
        }
        param_35 = N_2;
        param_36 = L_1;
        param_37 = V_1;
        param_38 = vec3f(0.30000001192092895508f, 0.30000001192092895508f, 0.89999997615814208984f);
        let x_1917 = shading_vf3_vf3_vf3_vf3_(&(param_35), &(param_36), &(param_37), &(param_38));
        color.x = x_1917.x;
        color.y = x_1917.y;
        color.z = x_1917.z;
        let x_1928 = spec_index;
        param_39 = color.xyz;
        let x_1932 = pack_color_vf3_(&(param_39));
        x_1927.ray_rgbz[x_1928] = vec2f(bitcast<f32>(x_1932), t_hit_1);
      }
    }

    continuing {
      i_6 = (i_6 + bitcast<u32>(1i));
    }
  }
  return;
}

@compute @workgroup_size(64i, 1i, 1i)
fn main(@builtin(local_invocation_id) gl_LocalInvocationID_param : vec3u, @builtin(workgroup_id) gl_WorkGroupID_param : vec3u) {
  gl_LocalInvocationID = gl_LocalInvocationID_param;
  main_1(gl_WorkGroupID_param);
}
`;

const compute_voxel_range_comp_spv = `struct BlockIDOffset {
  /* @offset(0) */
  block_id_offset : u32,
}

struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

alias RTArr = array<vec2f>;

struct BlockInformation {
  /* @offset(0) */
  block_ranges : RTArr,
}

alias RTArr_1 = array<vec2f>;

struct VoxelInformation {
  /* @offset(0) */
  voxel_ranges : RTArr_1,
}

struct EmulateUint64 {
  /* @offset(0) */
  lo : u32,
  /* @offset(4) */
  hi : u32,
}

alias RTArr_2 = array<EmulateUint64>;

struct Compressed {
  /* @offset(0) */
  compressed : RTArr_2,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(1) @binding(0) var<uniform> x_18 : BlockIDOffset;

@group(0) @binding(1) var<uniform> x_33 : VolumeParams;

@group(0) @binding(2) var<storage, read_write> x_91 : BlockInformation;

@group(2) @binding(0) var<storage, read_write> x_197 : VoxelInformation;

@group(0) @binding(0) var<storage, read_write> x_206 : Compressed;

fn main_1() {
  var block_index : u32;
  var total_blocks : u32;
  var n_blocks : vec3u;
  var block_pos : vec3u;
  var cell_range : vec2f;
  var k : i32;
  var j : i32;
  var i : i32;
  var neighbor : vec3u;
  var coords : vec3u;
  var neighbor_id : u32;
  block_index = (gl_GlobalInvocationID.x + (x_18.block_id_offset * 32u));
  total_blocks = (((x_33.padded_dims.x * x_33.padded_dims.y) / 64u) * x_33.padded_dims.z);
  n_blocks = (x_33.padded_dims.xyz / vec3u(4u));
  if ((block_index >= total_blocks)) {
    return;
  }
  block_pos.x = (block_index % n_blocks.x);
  block_pos.y = ((block_index / n_blocks.x) % n_blocks.y);
  block_pos.z = (block_index / (n_blocks.x * n_blocks.y));
  cell_range = x_91.block_ranges[block_index];
  k = 0i;
  loop {
    if ((k < 2i)) {
    } else {
      break;
    }
    j = 0i;
    loop {
      if ((j < 2i)) {
      } else {
        break;
      }
      i = 0i;
      loop {
        var x_144 : bool;
        var x_145 : bool;
        var x_152 : bool;
        var x_153 : bool;
        if ((i < 2i)) {
        } else {
          break;
        }
        neighbor = vec3u(bitcast<u32>(i), bitcast<u32>(j), bitcast<u32>(k));
        coords = (block_pos + neighbor);
        let x_138 = all((neighbor == vec3u()));
        x_145 = x_138;
        if (!(x_138)) {
          x_144 = any((coords < vec3u()));
          x_145 = x_144;
        }
        x_153 = x_145;
        if (!(x_145)) {
          x_152 = any((coords >= n_blocks));
          x_153 = x_152;
        }
        if (x_153) {
          continue;
        }
        neighbor_id = (coords.x + (n_blocks.x * (coords.y + (n_blocks.y * coords.z))));
        cell_range.x = min(x_91.block_ranges[neighbor_id].x, cell_range.x);
        cell_range.y = max(x_91.block_ranges[neighbor_id].y, cell_range.y);

        continuing {
          i = (i + 1i);
        }
      }

      continuing {
        j = (j + 1i);
      }
    }

    continuing {
      k = (k + 1i);
    }
  }
  let x_198 = block_index;
  x_197.voxel_ranges[x_198] = cell_range;
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const compute_coarse_cell_range_comp_spv = `struct BlockIDOffset {
  /* @offset(0) */
  block_id_offset : u32,
}

struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

alias RTArr = array<vec2f>;

struct BrickInformation {
  /* @offset(0) */
  voxel_ranges : RTArr,
}

alias RTArr_1 = array<vec2f>;

struct CoarseCellRange {
  /* @offset(0) */
  coarse_cell_ranges : RTArr_1,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(1) var<uniform> x_18 : BlockIDOffset;

@group(0) @binding(0) var<uniform> x_33 : VolumeParams;

@group(0) @binding(2) var<storage, read_write> x_119 : BrickInformation;

@group(0) @binding(3) var<storage, read_write> x_210 : CoarseCellRange;

fn main_1() {
  var coarse_cell_idx : u32;
  var total_coarse_cells : u32;
  var n_blocks : vec3u;
  var n_cells : vec3u;
  var cell_pos : vec3u;
  var block_pos : vec3u;
  var block_idx : u32;
  var coarse_cell_range : vec2f;
  var k : i32;
  var j : i32;
  var i : i32;
  var offs : vec3u;
  var coords : vec3u;
  var cur_block_idx : u32;
  coarse_cell_idx = (gl_GlobalInvocationID.x + (x_18.block_id_offset * 32u));
  total_coarse_cells = (((x_33.padded_dims.x * x_33.padded_dims.y) / 4096u) * x_33.padded_dims.z);
  if ((coarse_cell_idx >= total_coarse_cells)) {
    return;
  }
  n_blocks = (x_33.padded_dims.xyz / vec3u(4u));
  n_cells = vec3u(ceil((vec3f(n_blocks) / vec3f(4.0f))));
  cell_pos.x = (coarse_cell_idx % n_cells.x);
  cell_pos.y = ((coarse_cell_idx / n_cells.x) % n_cells.y);
  cell_pos.z = (coarse_cell_idx / (n_cells.x * n_cells.y));
  block_pos = (cell_pos * vec3u(4u));
  block_idx = (block_pos.x + (n_blocks.x * (block_pos.y + (n_blocks.y * block_pos.z))));
  coarse_cell_range = x_119.voxel_ranges[block_idx];
  k = 0i;
  loop {
    if ((k < 4i)) {
    } else {
      break;
    }
    j = 0i;
    loop {
      if ((j < 4i)) {
      } else {
        break;
      }
      i = 0i;
      loop {
        if ((i < 4i)) {
        } else {
          break;
        }
        offs = vec3u(bitcast<u32>(i), bitcast<u32>(j), bitcast<u32>(k));
        coords = (block_pos + offs);
        if (any((coords >= n_blocks))) {
          continue;
        }
        cur_block_idx = (coords.x + (n_blocks.x * (coords.y + (n_blocks.y * coords.z))));
        coarse_cell_range.x = min(x_119.voxel_ranges[cur_block_idx].x, coarse_cell_range.x);
        coarse_cell_range.y = max(x_119.voxel_ranges[cur_block_idx].y, coarse_cell_range.y);

        continuing {
          i = (i + 1i);
        }
      }

      continuing {
        j = (j + 1i);
      }
    }

    continuing {
      k = (k + 1i);
    }
  }
  let x_211 = coarse_cell_idx;
  x_210.coarse_cell_ranges[x_211] = coarse_cell_range;
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const reset_speculative_ids_comp_spv = `struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

alias RTArr = array<u32>;

struct RayIDs {
  /* @offset(0) */
  ray_ids : RTArr,
}

alias RTArr_1 = array<vec2f>;

struct RayRGBZ {
  /* @offset(0) */
  ray_rgbz : RTArr_1,
}

alias RTArr_2 = array<u32>;

struct RayBlockIDs {
  /* @offset(0) */
  block_ids : RTArr_2,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(0) var<uniform> x_19 : VolumeParams;

@group(0) @binding(1) var<storage, read_write> x_44 : RayIDs;

@group(0) @binding(2) var<storage, read_write> x_53 : RayRGBZ;

@group(0) @binding(3) var<storage, read_write> x_63 : RayBlockIDs;

fn main_1() {
  var ray_index : u32;
  if ((gl_GlobalInvocationID.x >= x_19.image_width)) {
    return;
  }
  ray_index = (gl_GlobalInvocationID.x + (gl_GlobalInvocationID.y * x_19.image_width));
  let x_46 = ray_index;
  x_44.ray_ids[x_46] = 4294967295u;
  let x_54 = ray_index;
  x_53.ray_rgbz[x_54] = vec2f(bitcast<f32>(0i), 340282346638528859811704183484516925440.0f);
  let x_64 = ray_index;
  x_63.block_ids[x_64] = 4294967295u;
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const depth_composite_comp_spv = `struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

struct ViewParams {
  /* @offset(0) */
  proj_view : mat4x4f,
  /* @offset(64) */
  eye_pos : vec4f,
  /* @offset(80) */
  eye_dir : vec4f,
  /* @offset(96) */
  near_plane : f32,
  /* @offset(100) */
  current_pass_index : u32,
  /* @offset(104) */
  speculation_count : u32,
}

alias RTArr = array<u32>;

struct RayIDs {
  /* @offset(0) */
  ray_ids : RTArr,
}

alias RTArr_1 = array<vec2f>;

struct RayRGBZ {
  /* @offset(0) */
  ray_rgbz : RTArr_1,
}

struct RayInfo {
  /* @offset(0) */
  ray_dir : vec3f,
  /* @offset(12) */
  t : f32,
}

alias RTArr_2 = array<RayInfo>;

struct RayInformation {
  /* @offset(0) */
  rays : RTArr_2,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(4) var<uniform> x_59 : VolumeParams;

@group(0) @binding(0) var<uniform> x_72 : ViewParams;

@group(0) @binding(1) var<storage, read_write> x_95 : RayIDs;

@group(0) @binding(2) var<storage, read_write> x_143 : RayRGBZ;

@group(0) @binding(3) var render_target : texture_storage_2d<rgba8unorm, write>;

@group(1) @binding(0) var<storage, read_write> x_203 : RayInformation;

fn unpack_color_i1_(rgb8 : ptr<function, i32>) -> vec3f {
  var rgb : vec3f;
  rgb = vec3f();
  rgb.x = (f32(((*(rgb8) >> bitcast<u32>(24i)) & 255i)) / 255.0f);
  rgb.y = (f32(((*(rgb8) >> bitcast<u32>(16i)) & 255i)) / 255.0f);
  rgb.z = (f32(((*(rgb8) >> bitcast<u32>(8i)) & 255i)) / 255.0f);
  let x_46 = rgb;
  return x_46;
}

fn main_1() {
  var spec_index : u32;
  var ray_index : u32;
  var pixel_coords : vec2i;
  var color : vec4f;
  var i : i32;
  var param : i32;
  if ((gl_GlobalInvocationID.x >= x_59.image_width)) {
    return;
  }
  if ((x_72.speculation_count > 1u)) {
    spec_index = ((gl_GlobalInvocationID.x + (gl_GlobalInvocationID.y * x_59.image_width)) * x_72.speculation_count);
    ray_index = x_95.ray_ids[spec_index];
  } else {
    ray_index = (gl_GlobalInvocationID.x + (gl_GlobalInvocationID.y * x_59.image_width));
    spec_index = ray_index;
  }
  pixel_coords = vec2i(bitcast<i32>((ray_index % x_59.image_width)), bitcast<i32>((ray_index / x_59.image_width)));
  color = vec4f(0.0f, 0.0f, 0.0f, 340282346638528859811704183484516925440.0f);
  i = 0i;
  loop {
    if ((bitcast<u32>(i) < x_72.speculation_count)) {
    } else {
      break;
    }
    if ((x_143.ray_rgbz[(spec_index + bitcast<u32>(i))].y < color.w)) {
      param = bitcast<i32>(x_143.ray_rgbz[(spec_index + bitcast<u32>(i))].x);
      let x_165 = unpack_color_i1_(&(param));
      color.x = x_165.x;
      color.y = x_165.y;
      color.z = x_165.z;
      color.w = x_143.ray_rgbz[(spec_index + bitcast<u32>(i))].y;
    }

    continuing {
      i = (i + 1i);
    }
  }
  if (!((color.w == 340282346638528859811704183484516925440.0f))) {
    let x_191 = pixel_coords;
    let x_193 = color.xyz;
    textureStore(render_target, x_191, vec4f(x_193.x, x_193.y, x_193.z, 1.0f));
  }
  if ((x_203.rays[ray_index].t == -340282346638528859811704183484516925440.0f)) {
    let x_211 = ray_index;
    x_203.rays[x_211].t = 340282346638528859811704183484516925440.0f;
  }
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const mark_ray_active_comp_spv = `struct VolumeParams {
  /* @offset(0) */
  volume_dims : vec4u,
  /* @offset(16) */
  padded_dims : vec4u,
  /* @offset(32) */
  volume_scale : vec4f,
  /* @offset(48) */
  max_bits : u32,
  /* @offset(52) */
  isovalue : f32,
  /* @offset(56) */
  image_width : u32,
}

alias RTArr = array<u32>;

struct RayActive {
  /* @offset(0) */
  ray_active : RTArr,
}

struct RayInfo {
  /* @offset(0) */
  ray_dir : vec3f,
  /* @offset(12) */
  t : f32,
}

alias RTArr_1 = array<RayInfo>;

struct RayInformation {
  /* @offset(0) */
  rays : RTArr_1,
}

var<private> gl_GlobalInvocationID : vec3u;

@group(0) @binding(0) var<uniform> x_19 : VolumeParams;

@group(0) @binding(2) var<storage, read_write> x_44 : RayActive;

@group(0) @binding(1) var<storage, read_write> x_52 : RayInformation;

fn main_1() {
  var ray_index : u32;
  if ((gl_GlobalInvocationID.x >= x_19.image_width)) {
    return;
  }
  ray_index = (gl_GlobalInvocationID.x + (gl_GlobalInvocationID.y * x_19.image_width));
  let x_46 = ray_index;
  x_44.ray_active[x_46] = bitcast<u32>(select(0i, 1i, !((x_52.rays[ray_index].t == 340282346638528859811704183484516925440.0f))));
  return;
}

@compute @workgroup_size(32i, 1i, 1i)
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID_param : vec3u) {
  gl_GlobalInvocationID = gl_GlobalInvocationID_param;
  main_1();
}
`;

const mark_block_active_wgsl_spv = `/*
// #include "util.glsl"
*/

const UINT_MAX: u32 = 0xffffffffu;
const FLT_MAX: f32 = 3.402823466e+38;

alias float2 = vec2<f32>;
alias float3 = vec3<f32>;
alias float4 = vec4<f32>;
alias uint2 = vec2<u32>;
alias uint3 = vec3<u32>;
alias uint4 = vec4<u32>;

struct RayInfo {
    ray_dir: float3,
    // block_id: u32,
    t: f32,
    // t_next: f32,
    // For WGSL we need to pad the struct up to 32 bytes so it matches
    // the GLSL struct alignment/padding rules we had before
    // @size(8) pad: f32
};

/*
layout(local_size_x = 8, local_size_y = 1, local_size_z = 1) in;
*/
/*
layout(set = 0, binding = 0, std140) uniform VolumeParams
{
    uvec4 volume_dims;
    uvec4 padded_dims;
    vec4 volume_scale;
    uint max_bits;
    float isovalue;
    uint image_width;
};
*/
struct VolumeParams {
  volume_dims: uint4,
  padded_dims: uint4,
  volume_scale: float4,
  max_bits: u32,
  isovalue: f32,
  image_width: u32,
}

@group(0) @binding(0) var<uniform> volume_params : VolumeParams;

/*
layout(set = 0, binding = 1, std140) uniform LOD
{
    uint LOD_threshold;
};
*/
struct LOD {
    threshold: f32,
}
@group(0) @binding(1) var<uniform> lod_threshold : LOD;

/*
layout(set = 0, binding = 2, std140) uniform ViewParams
{
    mat4 proj_view;
    vec4 eye_pos;
    vec4 eye_dir;
    float near_plane;
    uint current_pass_index;
};
*/
struct ViewParams {
  proj_view: mat4x4<f32>,
  eye_pos: float4,
  eye_dir: float4,
  near_plane : f32,
  current_pass_index: u32,
}
@group(0) @binding(2) var<uniform> view_params : ViewParams;

/*
layout(set = 0, binding = 3, std430) buffer BlockActive
{
    uint block_active[];
};
*/
// TODO: Is this valid WGSL? Try compiling with Tint
@group(0) @binding(3) var<storage, read_write> block_active : array<u32>;

/*
layout(set = 0, binding = 5, std430) buffer RayInformation
{
    RayInfo rays[];
};
*/
@group(0) @binding(4) var<storage, read_write> rays : array<RayInfo>;

/*
layout(set = 0, binding = 6, std430) buffer BlockVisible
{
    uint block_visible[];
};
*/
@group(0) @binding(5) var<storage, read_write> block_visible : array<atomic<u32>>;
@group(0) @binding(6) var<storage, read_write> block_ids : array<u32>;


//uniform layout(set = 1, binding = 0, rgba8) writeonly image2D render_target;
@group(1) @binding(0) var render_target : texture_storage_2d<rgba8unorm, write>;

fn block_id_to_pos(id: u32) -> uint3 {
    let n_blocks = volume_params.padded_dims.xyz / uint3(4u);
    return uint3(id % n_blocks.x,
            (id / n_blocks.x) % n_blocks.y,
            id / (n_blocks.x * n_blocks.y));
}

fn compute_block_id(block_pos: uint3) -> u32
{
    let n_blocks = volume_params.padded_dims.xyz / uint3(4u);
    return block_pos.x + n_blocks.x * (block_pos.y + n_blocks.y * block_pos.z);
}

@compute @workgroup_size(32, 1, 1)
fn main(@builtin(global_invocation_id) g_invocation_id : vec3<u32>) {
    if (g_invocation_id.x >= volume_params.image_width) {
        return;
    }

    let ray_index = g_invocation_id.x + g_invocation_id.y * volume_params.image_width;

    let block_id = block_ids[ray_index];
    if (block_id == UINT_MAX) {
        return;
    }
    let block_pos = block_id_to_pos(block_id);

    block_active[block_id] = 1u;
    //block_visible[block_id] = 1;
    let already_marked = atomicMax(&block_visible[block_id], 1u);

    // Count this ray for the block (this is now done in count_block_rays.wgsl
    //uint num_rays = atomicAdd(block_num_rays[block_id], uint(1)) + 1;
    //let num_rays = atomicAdd(&block_num_rays[block_id], 1u) + 1u;

    // Mark this ray's block's neighbors to the positive side as active
    // These blocks must be decompressed for neighbor data, but this ray
    // doesn't need to process them.
    if (already_marked == 0) {
        let n_blocks = volume_params.padded_dims.xyz / uint3(4u);
        for (var k = 0u; k < 2u; k += 1u) {
            for (var j = 0u; j < 2u; j += 1u) {
                for (var i = 0u; i < 2u; i += 1u) {
                    let neighbor = uint3(i, j, k);
                    let coords = block_pos + neighbor;
                    if (all(neighbor == uint3(0u)) || any(coords < uint3(0u)) || any(coords >= n_blocks)) {
                        continue;
                    }
                    let neighbor_id = compute_block_id(coords);
                    block_active[neighbor_id] = 1u;
                }               
            }
        }
    }
}
`;
const count_block_rays_wgsl_spv = `/*
// #include "util.glsl"
*/

const UINT_MAX: u32 = 0xffffffffu;
const FLT_MAX: f32 = 3.402823466e+38;

alias float2 = vec2<f32>;
alias float3 = vec3<f32>;
alias float4 = vec4<f32>;
alias uint2 = vec2<u32>;
alias uint3 = vec3<u32>;
alias uint4 = vec4<u32>;

struct VolumeParams {
  volume_dims: uint4,
  padded_dims: uint4,
  volume_scale: float4,
  max_bits: u32,
  isovalue: f32,
  image_width: u32,
}

@group(0) @binding(0) var<uniform> volume_params : VolumeParams;

@group(0) @binding(1) var<storage, read_write> block_num_rays : array<atomic<u32>>;

@group(0) @binding(2) var<storage, read_write> ray_block_ids : array<u32>;

@group(0) @binding(3) var<storage, read_write> block_compact_offsets : array<u32>;


@compute @workgroup_size(32, 1, 1)
fn main(@builtin(global_invocation_id) g_invocation_id : vec3<u32>) {
    if (g_invocation_id.x >= volume_params.image_width) {
        return;
    }

    let ray_index = g_invocation_id.x + g_invocation_id.y * volume_params.image_width;

    let block_id = ray_block_ids[ray_index];
    if (block_id == UINT_MAX) {
        return;
    }

    // Count this ray for the block
    let block_index = block_compact_offsets[block_id];
    atomicAdd(&block_num_rays[block_index], 1u);
}

`;
