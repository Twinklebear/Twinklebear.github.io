var chart = c3.generate({
	bindto: '#chart',
	axis: {
		y: {
			tick: {
				format: function(y){ return y + "ms"; }
			},
			label: {
				text: 'Render Time (in milliseconds)',
				position: 'outer-middle'
			}
		},
		x: {
		label: {
				text: 'Number of Threads',
				position: 'outer-left'
			}
		},
	},
	data: {
		x: 'threads',
		columns: [
			[ 'threads', 1, 2, 4, 8, 16, 32, 64 ],
			[ 'Desktop', 92, 49, 29, 24, 26.5, 27.5 ]
		]
	}
});

