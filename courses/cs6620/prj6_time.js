var bobj_chart = c3.generate({
	bindto: "#bobj_loading_chart",
	axis: {
		y: {
			tick: {
				format: function(y){return y + "ms";}
			},
			label: {
				text: "Load Time (in milliseconds)",
				position: "outer-middle"
			}
		},
		x: {
			type: "category",
			label: {
				text: "Model",
				position: "outer-right"
			}
		}
	},
	data: {
		x: "models",
		type: "bar",
		columns: [
			[ "models", "Dragon", "Happy Buddha", "Armadillo", "Bunny", "Phlegmatic Dragon", "Killeroo", "Teapot", "Suzanne" ],
			[ "Text OBJ", 277662, 353309, 112457, 22912, 151376, 8115, 1162, 371 ],
			[ "Binary OBJ", 12, 15, 5, 1, 6, 0, 0, 0 ]
		]
	}
});

var bvh_split_chart = c3.generate({
	bindto: "#bvh_split_chart",
	axis: {
		y: {
			tick: {
				format: function(y){return y + "ms";}
			},
			label: {
				text: "BVH Build Time (in milliseconds)",
				position: "outer-middle"
			}
		},
		x: {
			type: "category",
			label: {
				text: "Model",
				position: "outer-right"
			}
		}
	},
	data: {
		x: "models",
		type: "bar",
		columns: [
			[ "models", "Dragon", "Happy Buddha", "Armadillo", "Bunny", "Phlegmatic Dragon", "Killeroo", "Teapot", "Suzanne" ],
			[ "SAH", 625, 783, 251, 45, 328, 12, 3, 0],
			[ "Midpoint", 366, 455, 151, 27, 193, 7, 2, 0],
			[ "Equal Counts", 455, 564, 181, 32, 230, 9, 3, 0]
		]
	}
});

var bvh_render_chart = c3.generate({
	bindto: "#bvh_render_chart",
	axis: {
		y: {
			tick: {
				format: function(y){return y + "s";}
			},
			label: {
				text: "Render Time (in seconds)",
				position: "outer-middle"
			}
		},
		x: {
			type: "category",
			label: {
				text: "",
				position: "outer-right"
			}
		}
	},
	data: {
		x: "models",
		type: "bar",
		columns: [
			[ "models", "Model Madness Scene" ],
			[ "SAH", 62.078 ],
			[ "Midpoint", 65.194 ],
			[ "Equal Counts", 70.820 ]
		]
	}
});

