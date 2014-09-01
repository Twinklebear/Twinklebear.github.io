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
			[ 'Laptop', 104, 82.5, 69.5, 59.5, 56, 53.5, 50 ],
			[ 'Desktop', 109, 58, 31, 31, 34, 31.5, 30 ],
			[ 'Desktop B', 60.5, 34, 25, 19, 19.5, 19, 19 ]
		]
	}
});

