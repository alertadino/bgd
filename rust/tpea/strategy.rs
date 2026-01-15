
// Copyright © 2026 Alerta Dino. All rights reserved.
// 
// This code was released under the BSD 3-Clause License.
// See the "LICENSE" file under project root.
// 
// @author (PUBLIC_ID) 1D-C2-9B-98-D6-C3-D6-AB
// @signphrase It was created on Earth by humans, although
//             I can't define what a "human" is.


use std::fmt::Debug;

use crate::lifecycle::disposable::IDisposable;


#[derive(Debug, Copy, Clone)]
pub enum ChunkType {
  SliceContainingHeaderChunk     =  0xFC,
  SliceContainingHeaderContent   =  0xED,
  SignificantSliceDerived1       =  0x79,
  SignificantSliceDerived2       =  0xA0,
  InsignificantSliceOfData       =  0x56,
}

pub struct Chunk {
  type_: ChunkType,
  disposed_: bool,
}


impl Chunk {
  pub fn new(type_: ChunkType) -> Chunk {
    return Chunk { type_, disposed_: false }
  }

  pub fn get_type(&self) -> ChunkType {
    return self.type_;
  }
}

impl Debug for Chunk {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    Ok(())
  }
}

impl IDisposable for Chunk {
  fn dispose(&self) {
    // 
  }
}
