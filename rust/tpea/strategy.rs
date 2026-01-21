
// Copyright © 2026 Alerta Dino. All rights reserved.
// 
// This code was released under the BSD 3-Clause License.
// See the "LICENSE" file under project root.
// 
// @author (PUBLIC_ID) 1D-C2-9B-98-D6-C3-D6-AB
// @signphrase It was created on Earth by humans, although
//             I can't define what a "human" is.


use std::fmt::Debug;
use rand::{RngCore, random_range, rng};

use crate::{eff::EFF_WORDLIST, lifecycle::disposable::IDisposable};


#[derive(Debug, Copy, Clone)]
pub enum ChunkType {
  SliceContainingHeaderChunk     =  0xFC,
  SliceContainingHeaderContent   =  0xED,
  SignificantSliceDerived1       =  0x79,
  SignificantSliceDerived2       =  0xA0,
  InsignificantSliceOfData       =  0x56,
}

pub struct Chunk<'a> {
  type_: ChunkType,
  disposed_: bool,
  payload_: &'a [u8],
}


impl Chunk<'_> {
  pub const fn of_insignificant(len: usize) -> Chunk<'_> {
    let mut cursor: isize = -1;
    let dict: Vec<String> = Vec::new();

    while cursor < len as isize {
      let idx = random_range(0..=EFF_WORDLIST.len() - 1);
      let word = EFF_WORDLIST[idx];

      dict.push(word);
      cursor += (word.len() + 1) as isize;
    }

    while cursor >= len as isize {
      let word = dict.pop().unwrap();
      cursor -= (word.len() + 1) as isize;
    }

    let diff: usize = len - cursor as usize;

    if diff == 0 {
      panic!("[Chunk] Failed to create dictionary of random words");
    }

    let mut pad_chunk = vec![0u8; diff];
    rng().fill_bytes(&mut pad_chunk);

    let dict_bytes = dict.join("\n").as_bytes();
    let buf = Vec::with_capacity(pad_chunk.len() + dict_bytes.len());

    if diff > 6 {
      let mid = pad_chunk.len() / 2;

      buf.extend_from_slice(&pad_chunk[..mid]);
      buf.extend_from_slice(dict_bytes);
      buf.extend_from_slice(&pad_chunk[mid..]);
    } else {
      buf.extend_from_slice(&pad_chunk);
      buf.extend_from_slice(dict_bytes);
    }

    return Chunk {
      disposed_: false,
      payload_: buf.as_ref(),
      type_: ChunkType::InsignificantSliceOfData,
    }
  }

  pub const fn of_header_content(header: &[u8]) -> Chunk<'_> {
    Chunk {
      payload_: header,
      disposed_: false,
      type_: ChunkType::SliceContainingHeaderContent,
    }
  }

  pub const fn of_header(header: &[u8]) -> Chunk<'_> {
    Chunk {
      payload_: header,
      disposed_: false,
      type_: ChunkType::SliceContainingHeaderChunk,
    }
  }

  pub fn new(type_: ChunkType, payload_: &[u8]) -> Chunk<'_> {
    Chunk { type_, payload_, disposed_: false }
  }

  pub fn get_type(&self) -> ChunkType {
    return self.type_;
  }
}

impl Debug for Chunk<'_> {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    Ok(())
  }
}

impl IDisposable for Chunk<'_> {
  fn dispose(&self) {
    // 
  }
}
