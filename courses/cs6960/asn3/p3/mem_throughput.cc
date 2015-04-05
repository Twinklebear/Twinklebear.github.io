#include "trax.hpp"

// Get the memory address for the desired row, bank, channel, column
// in memory. Assumes address mapping mode 1, as specified in gddr5_2ch.config
// In address mapping 1 assuming big endian we have:
// int32 address:
// 	row  : 13
// 	bank : 4
// 	chan : 2
//	col  : 7
//	line : 6
// There seem to be 2 mystery bits hanging out at the high end and the last 4 bits are unused
#define MEM_ADDR(ROW, BANK, CHAN, COL) \
	(((ROW) << 17) | ((BANK) << 13) | ((CHAN) << 11) | ((COL) << 4))
#define MEM_BANK(BANK) ((BANK) << 13)
#define MEM_ROW(ROW) ((ROW) << 17)

void max_throughput();
void min_throughput();

void trax_main(){
	max_throughput();
}
void max_throughput(){
	int channel = GetThreadID();
	for (int col = 0; col < 128; ++col){
		int addr = MEM_ADDR(0, 0, channel, col);
		loadi(addr);
		loadi(addr, MEM_BANK(1));
		loadi(addr, MEM_BANK(2));
		loadi(addr, MEM_BANK(3));
		loadi(addr, MEM_BANK(4));
		loadi(addr, MEM_BANK(5));
		loadi(addr, MEM_BANK(6));
		loadi(addr, MEM_BANK(7));
		loadi(addr, MEM_BANK(8));
		loadi(addr, MEM_BANK(9));
		loadi(addr, MEM_BANK(10));
		loadi(addr, MEM_BANK(11));
		loadi(addr, MEM_BANK(12));
		loadi(addr, MEM_BANK(13));
		loadi(addr, MEM_BANK(14));
		loadi(addr, MEM_BANK(15));
	}
}
void min_throughput(){
	int channel = GetThreadID();
	for (int col = 0; col < 128; ++col){
		int addr = MEM_ADDR(col, 0, channel, col);
		loadi(addr);
		loadi(addr, MEM_ROW(1));
		loadi(addr, MEM_ROW(2));
		loadi(addr, MEM_ROW(3));
		loadi(addr, MEM_ROW(4));
		loadi(addr, MEM_ROW(5));
		loadi(addr, MEM_ROW(6));
		loadi(addr, MEM_ROW(7));
		loadi(addr, MEM_ROW(8));
		loadi(addr, MEM_ROW(9));
		loadi(addr, MEM_ROW(10));
		loadi(addr, MEM_ROW(11));
		loadi(addr, MEM_ROW(12));
		loadi(addr, MEM_ROW(13));
		loadi(addr, MEM_ROW(14));
		loadi(addr, MEM_ROW(15));
	}
}

